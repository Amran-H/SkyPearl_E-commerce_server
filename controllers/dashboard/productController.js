const formidable = require("formidable");
const productModel = require("../../models/productModel");
const { responseReturn } = require("../../utils/response");
const cloudinary = require("cloudinary").v2;


class productController {

    add_product = async (req, res) => {
        const { id } = req;
        const form = formidable({ multiples: true });

        form.parse(req, async (err, fields, files) => {
            let { name, description, category, price, stock, discount, brand, shopName } = fields;
            const { images } = files;
            console.log(fields);
            name = name.trim()
            const slug = name.split(' ').join('-');

            if (err) {
                responseReturn(res, 404, { error: err.message })
            } else {
                cloudinary.config({
                    cloud_name: process.env.cloud_name,
                    api_key: process.env.api_key,
                    api_secret: process.env.api_secret,
                    secure: true
                });

                try {
                    let allImageUrl = [];

                    for (let i = 0; i < images.length; i++) {
                        const result = await cloudinary.uploader.upload(images[i].filepath, { folder: 'products' });
                        allImageUrl = [...allImageUrl, result.url]
                    };

                    await productModel.create({
                        sellerId: id,
                        name,
                        slug,
                        shopName,
                        category: category.trim(),
                        brand: brand.trim(),
                        description: description.trim(),
                        stock: parseInt(stock),
                        price: parseInt(price),
                        discount: parseInt(discount),
                        images: allImageUrl
                    });
                    responseReturn(res, 201, { message: 'Product added successfully' })
                } catch (error) {
                    responseReturn(res, 500, { error: error.message })
                }

            }
        })

    };

    products_get = async (req, res) => {
        const { page, searchValue, perPage } = req.query;
        const { id } = req;

        const skipPage = parseInt(perPage) * (parseInt(page) - 1);

        try {
            if (searchValue) {
                const products = await productModel.find({
                    $text: { $search: searchValue },
                    sellerId: id
                }).skip(skipPage).limit(perPage).sort({ createdAt: -1 });
                const totalProduct = await productModel.find({
                    $text: { $search: searchValue },
                    sellerId: id
                }).countDocuments();
                responseReturn(res, 200, { totalProduct, products })
            } else {
                const products = await productModel.find({ sellerId: id }).skip(skipPage).limit(perPage).sort({ createdAt: -1 });

                const totalProduct = await
                    productModel.find({ sellerId: id }).countDocuments();
                responseReturn(res, 200, { totalProduct, products })
            }
        } catch (error) {
            console.log(error.message);
        }
    };

    product_get = async (req, res) => {
        const { productId } = req.params;
        try {
            const product = await productModel.findById(productId);
            responseReturn(res, 200, { product })
        } catch (error) {
            console.log(error.message);
        }
    };


    product_update = async (req, res) => {
        let { name, description, discount, price, brand, stock, productId } = req.body;

        name = name.trim();
        const slug = name.split('').join('-');
        try {
            await productModel.findByIdAndUpdate(productId, {
                name, description, discount, price, brand, stock, productId, slug
            });
            const product = await productModel.findById(productId);
            responseReturn(res, 200, { product, message: 'Product successfully updated' });
        } catch (error) {
            responseReturn(res, 500, { error: error.message })
        }
    };

    product_image_update = async (req, res) => {
        const form = formidable({ multiples: true })

        form.parse(req, async (err, fields, files) => {
            const { productId, oldImage } = fields;
            const { newImage } = files;

            if (err) {
                responseReturn(res, 404, { error: err.message })
            } else {
                try {
                    cloudinary.config({
                        cloud_name: process.env.cloud_name,
                        api_key: process.env.api_key,
                        api_secret: process.env.api_secret,
                        secure: true
                    });
                    const result = await cloudinary.uploader.upload(newImage.filepath, { folder: 'products' });

                    if (result) {
                        let { images } = await productModel.findById(productId);
                        const index = images.findIndex(img => img === oldImage);
                        images[index] = result.url;

                        await productModel.findByIdAndUpdate(productId, {
                            images
                        });

                        const product = await productModel.findById(productId);
                        responseReturn(res, 200, { product, message: 'Product images successfully updated' });
                    } else {
                        responseReturn(res, 404, { error: 'Image upload failed' })
                    }
                } catch (error) {
                    responseReturn(res, 404, { error: error.message })
                }
            }
        })
    };
}

module.exports = new productController