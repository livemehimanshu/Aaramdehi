// ===== RECENTLY VIEWED PRODUCTS UTILITY =====
// Yeh file products ko track karne ke liye hai
// Flipkart ki tarah recently viewed section ke liye

// Function: Product ko recently viewed list mein add karna
// Parameters: product = jo product add karna hai
export const addToRecentlyViewed = (product) => {
  // localStorage se pehle wali recently viewed products lao
  let recentlyViewed = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
  
  // Agar same product already hai toh usse remove karo (taki aage aa jaye)
  recentlyViewed = recentlyViewed.filter(item => item.id !== product.id);
  
  // Naya product sabse aage add karo
  recentlyViewed.unshift(product);
  
  // Sirf last 10 products rakhne hain (zyada na store ho)
  recentlyViewed = recentlyViewed.slice(0, 10);
  
  // localStorage mein save karo
  localStorage.setItem("recentlyViewed", JSON.stringify(recentlyViewed));
  
  // Event trigger karo taaki RecentlyViewed component update ho
  window.dispatchEvent(new Event("recentlyViewedUpdated"));
};

// Function: Recently viewed products ko get karna
export const getRecentlyViewed = () => {
  // localStorage se products lao, agar nahi ho toh empty array return karo
  return JSON.parse(localStorage.getItem("recentlyViewed")) || [];
};

// Function: Recently viewed history ko clear karna
export const clearRecentlyViewed = () => {
  // localStorage se recently viewed data delete karo
  localStorage.removeItem("recentlyViewed");
  // Event trigger karo component ko update karne ke liye
  window.dispatchEvent(new Event("recentlyViewedUpdated"));
};
