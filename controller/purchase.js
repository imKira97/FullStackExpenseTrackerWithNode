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
    const status = req.body.status;
    const payment_id = req.body.paymentid;
    const order_id = req.body.orderid;
    if (status === "success") {
      console.log(payment_id, order_id);
      const order = await Order.findOne({ where: { orderid: order_id } });
      const promise1 = order.update({
        paymentid: payment_id,
        status: "SUCCESSFULL",
      });
      const promise2 = req.user.update({ isPremiumUser: true });

      Promise.all([promise1, promise2])
        .then(() => {
          return res
            .status(201)
            .json({ success: true, message: "Transcation Done" });
        })
        .catch((err) => {
          throw new Error(err);
        });
    } else {
      const order = await Order.findOne({ where: { orderid: order_id } });
      const promise1 = order.update({
        paymentid: payment_id,
        status: "Failure",
      });
      const promise2 = req.user.update({ isPremiumUser: false });
      Promise.all([promise1, promise2])
        .then(() => {
          return res
            .status(201)
            .json({ success: false, message: "Transcation Failed" });
        })
        .catch((err) => {
          throw new Error(err);
        });
    }
  } catch (err) {
    console.log(err);
  }
};
