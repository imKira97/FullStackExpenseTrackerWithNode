const Razorpay = require("razorpay");
const Order = require("../model/orders");

exports.purchasePremium = async (req, res) => {
  try {
    var rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const amount = 2500;
    //amount and currenct sgould pass from backend
    rzp.orders.create({ amount, currency: "INR" }, (err, order) => {
      if (err) {
        throw new Error(JSON.stringify(err));
      }
      req.user
        .createOrder({ orderid: order.id, status: "PENDING" })
        .then(() => {
          return res.status(201).json({ order, key_id: rzp.key_id });
        })
        .catch((err) => {
          throw new Error(err);
        });
    });
  } catch (err) {
    console.log(err);
  }
};

exports.updateTranscation = async (req, res) => {
  try {
    console.log("body" + req.body);
    const payment_id = req.body.paymentid;
    const order_id = req.body.orderid;
    console.log(payment_id, order_id);
    Order.findOne({ where: { orderid: order_id } })
      .then((order) => {
        order
          .update({ paymentid: payment_id, status: "SUCCESSFULL" })
          .then(() => {
            req.user
              .update({ isPremiumUser: true })
              .then(() => {
                return res
                  .status(201)
                  .json({ success: true, message: "Transcation Done" });
              })
              .catch((err) => console.log(err));
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
  }
};
