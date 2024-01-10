const adminModel = require("../models/adminModel");
const bcrypt = require("bcrypt");
const { responseReturn } = require("../utils/response");
const jwt = require("jsonwebtoken");
const formidable = require("formidable");
const cloudinary = require("cloudinary").v2;
const { jwtTokenCreate } = require("../utils/jwtTokenCreate");
const sellerModel = require("../models/sellerModel");
const sellerCustomerModel = require("../models/chat/sellerCustomerModel");

class authControllers {
    admin_login = async (req, res) => {
        const { email, password } = req.body;

        try {
            const admin = await adminModel.findOne({ email }).select('+password');
            if (admin) {
                const match = await bcrypt.compare(password, admin.password)
                if (match) {
                    const token = await jwtTokenCreate({
                        id: admin.id,
                        role: admin.role
                    })
                    res.cookie('accessToken', token, {
                        expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
                    });
                    responseReturn(res, 200, { token, message: "Successfully Logged in" })
                } else {
                    responseReturn(res, 404, { error: "Invalid email or password" })
                }
            } else {
                responseReturn(res, 404, { error: "Email not sound" })
            }

        } catch (error) {
            responseReturn(res, 500, { error: error.message })
        }
    };

    seller_register = async (req, res) => {
        const { name, email, password } = req.body;
        try {
            const getUser = await sellerModel.findOne({ email });
            if (getUser) {
                responseReturn(res, 404, { error: 'Email already exist' })
            } else {
                const seller = await sellerModel.create({
                    name,
                    email,
                    password: await bcrypt.hash(password, 10),
                    method: 'manually',
                    shopInfo: {}
                })
                await sellerCustomerModel.create({
                    myId: seller.id,
                })
                const token = await jwtTokenCreate({ id: seller.id, role: seller.role });
                res.cookie('accessToken:', token, {
                    expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
                });
                responseReturn(res, 201, { token, message: 'Registered Successfully' })
            }
        } catch (error) {
            responseReturn(res, 500, { error: 'Internal server error!' })
        }
    };

    seller_login = async (req, res) => {
        const { email, password } = req.body;

        try {
            const seller = await sellerModel.findOne({ email }).select('+password');
            if (seller) {
                const match = await bcrypt.compare(password, seller.password)
                if (match) {
                    const token = await jwtTokenCreate({
                        id: seller.id,
                        role: seller.role
                    })
                    res.cookie('accessToken', token, {
                        expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
                    });
                    responseReturn(res, 200, { token, message: "Successfully Logged in" })
                } else {
                    responseReturn(res, 404, { error: "Invalid email or password" })
                }
            } else {
                responseReturn(res, 404, { error: "Email not found" })
            }

        } catch (error) {
            responseReturn(res, 500, { error: error.message })
        }
    };

    getUser = async (req, res) => {
        const { id, role } = req;
        try {
            if (role === 'admin') {
                const user = await adminModel.findById(id)
                responseReturn(res, 200, { userInfo: user })
            } else {
                const seller = await sellerModel.findById(id)
                responseReturn(res, 200, { userInfo: seller })
            }
        } catch (error) {
            responseReturn(res, 500, { error: 'Internal server error!' })
        }
    };

    profile_image_upload = async (req, res) => {
        const form = formidable({ multiples: true })

        form.parse(req, async (err, _, files) => {
            const { id } = req;
            const { image } = files;

            cloudinary.config({
                cloud_name: process.env.cloud_name,
                api_key: process.env.api_key,
                api_secret: process.env.api_secret,
                secure: true
            });

            try {
                const result = await cloudinary.uploader.upload(image.filepath, { folder: 'profile' });

                if (result) {
                    await sellerModel.findByIdAndUpdate(id, {
                        image: result.url
                    });
                    const userInfo = await sellerModel.findById(id);
                    responseReturn(res, 201, { message: 'Image successfully uploaded', userInfo })
                } else {
                    responseReturn(res, 404, { error: 'Image upload failed' })
                }
            } catch (error) {
                responseReturn(res, 500, { error: error.message })
            }
        })
    }

    profile_info_add = async (req, res) => {
        const { division, district, shopName, subDistrict } = req.body;
        const { id } = req;

        try {
            await sellerModel.findByIdAndUpdate(id, {
                shopInfo: {
                    division,
                    district,
                    shopName,
                    subDistrict
                }
            });
            const userInfo = await sellerModel.findById(id);
            responseReturn(res, 201, { message: 'Shop info successfully added', userInfo })
        } catch (error) {
            responseReturn(res, 500, { error: error.message })
        }
    }
}

module.exports = new authControllers()