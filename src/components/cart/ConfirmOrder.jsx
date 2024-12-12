import MetaData from "../layouts/MetaData";
import { Fragment, useEffect } from "react";
import { validateShipping } from "./Shipping";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import CheckoutSteps from "./CheckoutStep";
import axiosInstance from "../../setupProxy";
import { toast } from "react-toastify";
import { orderCompleted } from "../../slices/cartSlice";
import { createOrder } from "../../actions/orderActions";

export default function ConfirmOrder() {
  const { shippingInfo, items: cartItems } = useSelector(
    (state) => state.cartState
  );
  const { user } = useSelector((state) => state.authState);
  const { error: orderError } = useSelector((state) => state.orderState);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const itemsPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const shippingPrice = itemsPrice > 200 ? 0 : 25;
  let taxPrice = Number(0.05 * itemsPrice);
  const totalPrice = Number(itemsPrice + shippingPrice + taxPrice).toFixed(2);
  taxPrice = Number(taxPrice).toFixed(2);

  const processPayment = () => {
    const data = {
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    };
    sessionStorage.setItem("orderInfo", JSON.stringify(data));
    navigate("/payment");
    location.reload();
  };

  const initRazorpayPayment = (data) => {
    const options = {
      key: "rzp_test_YSJB72WmspGNTW",
      amount: data.amount,
      currency: data.currency,
      name: "Ecommerce Order Payment",
      description: "Test Transaction",
      image: user.avatar,
      order_id: data.id,
      handler: async (response) => {
        try {
          const verifyUrl = "/api/v1/payment/razorpay/verify";
          const result = await axiosInstance.post(verifyUrl, response);

          if (!(await result.data.success)) {
            toast(result.data.message, {
              type: "error",
              position: toast.POSITION.BOTTOM_CENTER,
            });
          } else {
            if (result.data.success) {
              toast("Payment Success!", {
                type: "success",
                position: toast.POSITION.BOTTOM_CENTER,
              });
              const orderInfo = JSON.parse(sessionStorage.getItem("orderInfo"));

              const order = {
                orderItems: cartItems,
                shippingInfo,
              };
              order.paymentInfo = {
                id: data.id,
                status: result.data.success === true ? "succeeded" : "failed",
              };
              if (orderInfo) {
                order.itemsPrice = orderInfo.itemsPrice;
                order.shippingPrice = orderInfo.shippingPrice;
                order.taxPrice = orderInfo.taxPrice;
                order.totalPrice = orderInfo.totalPrice;
              }

              dispatch(orderCompleted());
              dispatch(createOrder(order));
              navigate("/order/success");
            } else {
              toast("Please Try again!", {
                type: "warning",
                position: toast.POSITION.BOTTOM_CENTER,
              });
            }
          }
        } catch (error) {
          console.log(error);
        }
      },
      theme: {
        color: "#3399cc",
      },
    };
    const rzp1 = new window.Razorpay(options);
    rzp1.open();
  };
  const handleRazorpayPayment = async () => {
    try {
      const orderdata = {
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
      };
      sessionStorage.setItem("orderInfo", JSON.stringify(orderdata));
      const orderUrl = "/api/v1/payment/razorpay/orders";
      const { data } = await axiosInstance.post(orderUrl, {
        amount: totalPrice,
      });

      initRazorpayPayment(data.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    validateShipping(shippingInfo, navigate);
    if (orderError) {
      toast(orderError, {
        position: toast.POSITION.BOTTOM_CENTER,
        type: "error",
        onOpen: () => {
          dispatch(clearOrderError());
        },
      });
      return;
    }
  }, []);

  return (
    <Fragment>
      <MetaData title={"Confirm Order"} />
      <CheckoutSteps shipping confirmOrder />
      <div className="row d-flex justify-content-between">
        <div className="col-12 col-lg-8 mt-5 order-confirm minwidth350">
          <h4 className="mb-3">Shipping Info</h4>
          <p>
            <b>Name:</b> {user.name}
          </p>
          <p>
            <b>Phone:</b> {shippingInfo.phoneNo}
          </p>
          <p className="mb-4">
            <b>Address:</b> {shippingInfo.address}, {shippingInfo.city},{" "}
            {shippingInfo.postalCode}, {shippingInfo.state},{" "}
            {shippingInfo.country}{" "}
          </p>

          <hr />
          <h4 className="mt-4">Your Cart Items:</h4>

          {cartItems.map((item, i) => (
            <Fragment key={i}>
              <div className="cart-item my-1">
                <div className="row">
                  <div className="col-4 col-lg-2">
                    <img
                      src={item.image}
                      alt={item.name}
                      height="45"
                      width="65"
                    />
                  </div>

                  <div className="col-5 col-lg-6">
                    <Link to={`/product/${item.product}`}>{item.name}</Link>
                  </div>

                  <div className="col-4 col-lg-4 mt-4 mt-lg-0 confirmOrder-amount">
                    <p>
                      {item.quantity} x ${item.price} ={" "}
                      <b>${item.quantity * item.price}</b>
                    </p>
                  </div>
                </div>
              </div>
              <hr />
            </Fragment>
          ))}
        </div>

        <div className="col-12 col-lg-3 my-4">
          <div id="order_summary">
            <h4>Order Summary</h4>
            <hr />
            <p>
              Subtotal:{" "}
              <span className="order-summary-values">${itemsPrice}</span>
            </p>
            <p>
              Shipping:{" "}
              <span className="order-summary-values">${shippingPrice}</span>
            </p>
            <p>
              Tax: <span className="order-summary-values">${taxPrice}</span>
            </p>

            <hr />

            <p>
              Total: <span className="order-summary-values">${totalPrice}</span>
            </p>

            <hr />
            <button
              id="checkout_btn"
              onClick={processPayment}
              className="btn btn-primary btn-block"
            >
              Proceed with Stripe
            </button>
            <button
              id="checkout_btn"
              onClick={handleRazorpayPayment}
              className="btn btn-primary btn-block"
            >
              Proceed with Razorpay
            </button>
          </div>
        </div>
      </div>
    </Fragment>
  );
}
