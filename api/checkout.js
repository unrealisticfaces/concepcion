const handleCheckout = async () => {
  if (!user) {
    showToast("Log in to proceed to checkout.", "error");
    navigate('/login?redirect=/cart');
    return;
  }

  try {
    showToast("Redirecting to GCash...", "success");

    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: total,
        description: `Cart Order (${cartItems.length} items)`
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Payment failed');
    }

    // Save transaction to Firebase
    const newTransaction = {
      user: user.email || "Guest",
      type: "Purchase",
      item: `Cart Order (${cartItems.length} items)`,
      amount: total,
      date: new Date().toLocaleDateString(),
      status: "Pending",
      timestamp: Date.now()
    };

    await push(ref(db, 'transactions'), newTransaction);

    // Redirect to PayMongo GCash checkout
    window.location.href = data.checkoutUrl;

  } catch (error) {
    console.error(error);
    showToast(error.message, "error");
  }
};