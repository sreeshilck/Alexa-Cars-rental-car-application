
# Alexa-Cars

A car rental application using Node.js, Express.js, MongoDB



## Screenshot

![alexacars-readmeImg](https://user-images.githubusercontent.com/102411922/187904684-fc6f1eac-b8f5-4e1e-b841-1e2a8eb4e4ee.png)


## Demo


[alexacars.ml](https://alexacars.ml/)
## Tech Stack

**Client:** Bootstrap, JQuery, Ajax

**Server:** Node, Express

**Payment Integration:** Razorpay

**Email Service:** Nodemailer

**Deploy:** AWS (EC2)




## Features
**Users can do following:**
- Create an account, login or logout
- Browse available cars added by the admin
- Users can rent a car based on their needs and favorable rental plans
- The pick-up and drop-off times, as well as the pick-up and drop-off
   locations, are customizable by the users.
- Can redeem coupons for discounts and offers.
- Checkout information is processed with razorpay and the payment is send to the admin.
- After booking, the user can check the booking history and can also cancel the booking.
- The profile contains all the orders a user has made.
- Update their profile

**Admin can do following:**
- Login or logout to the admin panel
- Manage cars.
- Manage users.
- Manage bookings.
- Manage payments.
- Manage coupons.   


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`AUTH_EMAIL` (nodemailer auth email)

`AUTH_PASSWORD` (nodemailer auth email password)

`RazorPayKeyId`

`RazorPaySecretKey`

`SECRET_KEY_SESSION`

`MONGO_URL` 


## Run Locally

Clone the project

```bash
  git clone https://github.com/sreeshilck/Alexa-Cars-rental-car-application
```

Go to the project directory

```bash
  cd Alexa-Cars-rental-car-application
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm start
```


## Author

- [@sreeshilck](https://github.com/sreeshilck)


## License

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

