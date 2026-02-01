// categoriesData.js
import { mobileProducts, laptopProducts } from './productData';

const categoriesData = [
  {
    title: "MOBILE PARTS",
    route: "/list",
    items: mobileProducts.slice(0, 6) // Show first 6 items in home page
  },
  {
    title: "LAPTOP PARTS",
    route: "/list",
    items: laptopProducts.slice(0, 6) // Show first 6 items in home page
  }
];

export default categoriesData;