# Aaramdehi Data Folder Structure

## 📁 Data Folder Location: `/src/data/`

Aapka sara centralized product data yeh raha hai:

### 1. **categories.js**
   - تمام categories اور subcategories
   - Yeh file header navigation aur sidebar میں استعمال ہوتی ہے

### 2. **products.js**
   - تمام product listing data (ALL_PRODUCTS_DATA array)
   - Pagination, filtering, sorting کے لیے
   - ProductListing page میں استعمال ہوتا ہے

### 3. **productDetails.js**
   - Individual product کی تفصیل (productDetailsData object)
   - Related items کی معلومات (relatedItemsData array)
   - Product detail page میں استعمال ہوتا ہے

---

## 📝 Updated Files:

✅ **component/Pages/ProductListing/index.jsx**
- Ab `src/data/products.js` سے `ALL_PRODUCTS_DATA` import کرتا ہے

✅ **component/Pages/productpage/ProductDetailsPage.jsx**
- Ab `src/data/productDetails.js` سے `productDetailsData` اور `relatedItemsData` import کرتا ہے

✅ **component/categorydata/categoryData.jsx**
- Ab `src/data/categories.js` سے `categoriesData` import کرتا ہے

---

## 🚀 فوائل:

1. **Centralized Data Management** - ایک جگہ سے سب کچھ manage کریں
2. **Easy Updates** - نیا data add کرنا آسان ہے
3. **Reusable** - کسی بھی page سے data استعمال کر سکتے ہو
4. **Better Organization** - Code clean اور organized رہتا ہے

---

## 📌 نیا Data ہے تو کیا کریں:

سب سے پہلے `/src/data/` folder میں اپنا file edit کریں، پھر automatically سب pages update ہو جائے گی ✨
