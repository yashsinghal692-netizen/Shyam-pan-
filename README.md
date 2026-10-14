# Shyam Pan Corner

A responsive, no-build storefront for daily counter orders, local delivery within 2 km, and wedding paan catering. Product browsing, cart, UPI QR checkout, WhatsApp order confirmation, and a WhatsApp-based inquiry form run in the browser.

## Run

Open index.html in a static web server or serve this folder from the project host. There are no build tools or package installs.

## Store configuration

Edit the CONFIG object near the top of app.js:

- upiId: UPI payment address used to form the QR payment intent.
- shopName: payee name shown in the UPI intent.
- whatsappNumber: WhatsApp number in international digits, without plus sign or spaces.
- webhookUrl: paste the n8n production webhook URL here. It is currently blank because no URL was supplied. Once configured, confirming an order sends a JSON POST in the background; a failed request is deliberately not shown to the customer.

The UPI QR contains the current product total in INR. The customer scans and pays with their UPI app, then confirms the order in WhatsApp. Delivery orders collect an address, contact number, and a customer confirmation that the address is within 2 km; any delivery charge is confirmed separately on WhatsApp. Counter pickup is also available. The shop should verify receipt before fulfilling. WhatsApp confirmation is not a payment verification signal.

## Scope and production integrations

This is a static storefront: it does not create customer accounts, store order history on a server, send email, process card payments, or verify UPI transactions. No OAuth, email, payment gateway, or backend credentials were supplied, and secrets must not be embedded in browser code. For production authentication, order persistence, email delivery, card/wallet payments, webhook signature verification, and payment-status handling, connect a trusted server/backend and configure the relevant provider credentials there.

Product names and INR prices are in the PRODUCTS array in app.js. Cart contents are saved in this browser's local storage. The generated transparent logo emblem is assets/shyam-paan-logo.png. The downloadable 10-variety menu is paan-varieties-menu.pdf; its prices are indicative suggestions and tasting notes are sample copy, not customer reviews.
