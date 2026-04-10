import React from 'react'
import './PaymentButton.css'
import { useNavigate } from "react-router-dom";

const Payment_Button = (

) => {
  const navigate = useNavigate();
  const GotoPayment = () => {


    
    console.log("Navigating to payment page");
    navigate('/payment',{ replace: true });
    // Here you can navigate to the payment page or trigger payment process

  }

  return (
    <button className="button" style={{ "--clr": "#00ad54" }}
      onClick={GotoPayment}
    >
      <span className="button-decor"></span>
      <div className="button-content">
        <div className="button__icon">
          <svg
            viewBox="0 0 50 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
          >
            <circle
              opacity="0.5"
              cx="25"
              cy="25"
              r="23"
              fill="url(#icon-payments-cat_svg__paint0_linear_1141_21101)"
            ></circle>
            <mask id="icon-payments-cat_svg__a" fill="#fff">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M34.42 15.93c.382-1.145-.706-2.234-1.851-1.852l-18.568 6.189c-1.186.395-1.362 2-.29 2.644l5.12 3.072a1.464 1.464 0 001.733-.167l5.394-4.854a1.464 1.464 0 011.958 2.177l-5.154 4.638a1.464 1.464 0 00-.276 1.841l3.101 5.17c.644 1.072 2.25.896 2.645-.29L34.42 15.93z"
              ></path>
            </mask>
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M34.42 15.93c.382-1.145-.706-2.234-1.851-1.852l-18.568 6.189c-1.186.395-1.362 2-.29 2.644l5.12 3.072a1.464 1.464 0 001.733-.167l5.394-4.854a1.464 1.464 0 011.958 2.177l-5.154 4.638a1.464 1.464 0 00-.276 1.841l3.101 5.17c.644 1.072 2.25.896 2.645-.29L34.42 15.93z"
              fill="#fff"
            ></path>
            <defs>
              <linearGradient
                id="icon-payments-cat_svg__paint0_linear_1141_21101"
                x1="25"
                y1="2"
                x2="25"
                y2="48"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#fff" stopOpacity="0.71"></stop>
                <stop offset="1" stopColor="#fff" stopOpacity="0"></stop>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <span className="button__text">Proceed </span>
      </div>
    </button>
  )
}

export default Payment_Button
