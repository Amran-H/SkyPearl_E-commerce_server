const formidable = require('formidable');
const { responseReturn } = require("../../utils/response");
const sellerModel = require("../../models//sellerModel");

class sellerController {

    get_seller_request = async (req, res) => {
        const { page, searchValue, perPage } = req.query;

        const skipPage = parseInt(perPage) * (parseInt(page) - 1);

        try {
            if (searchValue) {

            } else {
                const sellerRequests = await sellerModel.find({ status: 'pending' }).skip(skipPage).limit(perPage).sort({ createdAt: -1 });

                const totalSellerRequests = await sellerModel.find({ status: 'pending' }).countDocuments();
                responseReturn(res, 200, { totalSellerRequests, sellerRequests })
            }
        } catch (error) {
            responseReturn(res, 500, { error: error.message })
        }
    };

    get_seller = async (req, res) => {
        const { sellerId } = req.params;
        try {
            const seller = await sellerModel.findById(sellerId);
            responseReturn(res, 200, { seller })

        } catch (error) {
            responseReturn(res, 500, { error: error.message })
        }

    };


    seller_status_update = async (req, res) => {
        const { sellerId, status } = req.body;
        try {
            await sellerModel.findByIdAndUpdate(sellerId, { status });
            const seller = await sellerModel.findById(sellerId);
            responseReturn(res, 200, { seller, message: 'Status updated successfully' })

        } catch (error) {
            responseReturn(res, 500, { error: error.message })
        }

    };

    get_all_sellers = async (req, res) => {
        const { page, searchValue, perPage } = req.query;
        try {
            let skipPage = '';
            if (perPage && page) {
                skipPage = parseInt(perPage) * (parseInt(page) - 1);
            }
            if (searchValue && page && perPage) {
                const sellers = await sellerModel.find({
                    $text: { $search: searchValue }
                }).skip(skipPage).limit(perPage).sort({ createdAt: -1 });
                const totalSeller = await sellerModel.find({
                    $text: { $search: searchValue }
                }).countDocuments();
                responseReturn(res, 200, { totalSeller, sellers })
            }
            else if (searchValue === '' && page && perPage) {
                const sellers = await sellerModel.find({}).skip(skipPage).limit(perPage).sort({ createdAt: -1 });

                const totalSeller = await
                    sellerModel.find({}).countDocuments();
                responseReturn(res, 200, { totalSeller, sellers })
            }
            else {
                const sellers = await sellerModel.find({}).sort({ createdAt: -1 });

                const totalSeller = await sellerModel.find({}).countDocuments();
                responseReturn(res, 200, { totalSeller, sellers })
            }
        } catch (error) {
            console.log(error.message);
        }

    }
}

module.exports = new sellerController()