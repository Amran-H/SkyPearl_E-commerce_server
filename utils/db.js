const { mongoose } = require("mongoose")

module.exports.dbConnect = async () => {
    try {
        const dbURI = `${process.env.DB_URI}/skypearl_e-commerce`;

        const connection = await mongoose.connect(dbURI, { useNewURLParser: true })
        console.log("database Connected");

        return connection;
    } catch (error) {
        console.error(error.message);
    }
};
