export type CannedResponse = {
  id: string;
  title: string;
  category: string;
  body: string;
};

export const cannedResponses: CannedResponse[] = [
  {
    id: "cr-router-offline-1",
    title: "Router offline — initial response",
    category: "technical",
    body: "Thank you for contacting us. We can see your router is currently offline. Please ensure your router is powered on and has internet connectivity. If the issue persists, please check that the WireGuard configuration script has been applied correctly by following the setup guide at [link]. We will monitor your router and follow up if needed.",
  },
  {
    id: "cr-billing-payment-1",
    title: "Payment received — confirmation",
    category: "billing",
    body: "Thank you for your payment. We have received and confirmed your payment. Your service will remain active. If you have any billing questions, please do not hesitate to contact us.",
  },
  {
    id: "cr-billing-overdue-1",
    title: "Payment overdue — reminder",
    category: "billing",
    body: "This is a reminder that your account has an overdue payment. To avoid service interruption, please make payment at your earliest convenience. You can pay via M-Pesa, bank transfer, or cash at our offices. Please contact us if you need to arrange a payment plan.",
  },
  {
    id: "cr-provisioning-1",
    title: "Router provisioning — setup instructions",
    category: "technical",
    body: "To set up your MikroTik router, please download and run the WireGuard configuration script from your subscriber portal. The script will automatically configure the VPN tunnel. Once the tunnel is active, you should see your router online within 5 minutes. If you encounter any issues, please reply with the error message displayed.",
  },
  {
    id: "cr-general-close-1",
    title: "Issue resolved — closing ticket",
    category: "general",
    body: "We are glad to confirm that the reported issue has been resolved. Your service is now fully operational. Please do not hesitate to contact us if you experience any further issues. We will close this ticket in 48 hours if no further response is received.",
  },
  {
    id: "cr-escalation-1",
    title: "Escalation — under urgent review",
    category: "general",
    body: "Your issue has been escalated to our senior technical team and is being treated as a high priority. We will provide an update within 2 hours. We apologize for the inconvenience and appreciate your patience.",
  },
  {
    id: "cr-vpn-config-1",
    title: "VPN configuration — regenerate steps",
    category: "technical",
    body: "We have regenerated your VPN configuration. Please log in to your subscriber portal and download the new WireGuard configuration script. Run the script on your MikroTik router via the terminal and allow 5 minutes for the tunnel to establish. Your previous configuration will no longer work after this update.",
  },
  {
    id: "cr-feature-request-1",
    title: "Feature request — acknowledged",
    category: "feature_request",
    body: "Thank you for submitting this feature request. We have logged it with our product team for consideration in a future update. We will notify you if and when this feature becomes available. We appreciate your feedback in helping us improve our service.",
  },
];
