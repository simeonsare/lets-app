import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingCart, Eye, Trash2 } from "lucide-react";
import { useProducts } from '@/hooks/products';
import{toggelwishlist} from '@/utils/wishlist';
import { handleAddToCart } from '@/utils/cart';



const token = localStorage.getItem("authToken") || "";

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  discount?: number;
}

export const Wishlist = () => {
  const products = useProducts();
  const navigate = useNavigate
  
  const [wishlistItems, setWishlist] = useState<WishlistItem[]>([]);
    useEffect(() => {
    fetch("/api/getwishlist/",{
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${token}`,}
    })
      .then(res => res.json())
      .then(data => setWishlist(data.data))
      .catch(() => setWishlist([]));
  }, []);
 

  const moveAllToBag = () => {
    // Handle moving all items to bag
    console.log("Moving all items to bag");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl">Wishlist ({wishlistItems.length})</h1>
        
      </div>

      {/* Wishlist Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {wishlistItems.map((item) => (
          <Card key={item.id} className="group relative overflow-hidden">
            <CardContent className="p-0">
              {/* Discount Badge */}
              {item.discount && (
                <div className="absolute top-3 left-3 bg-destructive text-white px-2 py-1 text-xs rounded z-10">
                  -{item.discount}%
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                <Button size="icon" variant="outline" className="h-8 w-8 bg-white" onClick={() => toggelwishlist(item.product.id,item.product.name)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Product Image */}
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
              <a href={`product/${item.product.id}`} key={item.product.id}>
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              </a>
                
                {/* Add to Cart Button */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-3 transform translate-y-full group-hover:translate-y-0 transition-transform">
                  <Button className="w-full bg-black hover:bg-gray-800 text-white" onClick={() => handleAddToCart(item.product.id, item.product.name)}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add To Cart
                  </Button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-medium mb-2">{item.product.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-destructive font-bold">kshs {item.product.price}</span>
                  {item.product.originalPrice && (
                    <span className="text-gray-500 line-through text-sm">
                      kshs {item.product.originalPrice}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Just For You Section 
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="w-5 h-10 bg-destructive rounded"></div>
            <h2 className="text-xl font-medium">Just For You</h2>
          </div>
          <Button variant="outline">See All</Button>
        </div>

       
                <section>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {products
                      .filter(p => p.category === product.category && p.id !== product.id)
                      .slice(0, 4)
                      .map(relatedProduct => (
                        <Card key={relatedProduct.id} className="group cursor-pointer hover:shadow-lg transition-normal">
                          <CardContent className="p-4">
                            <img 
                              src={relatedProduct.image}
                              alt={relatedProduct.name}
                              className="w-full h-32 object-cover rounded mb-3 group-hover:scale-105 transition-slow"
                              onClick={() => navigate(`/product/kshs {relatedProduct.id}`)}
                            />
                            <h3 className="font-semibold text-sm mb-2 line-clamp-2">{relatedProduct.name}</h3>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-primary">ksh {relatedProduct.price}</span>
                              <Button size="sm" variant="outline"
                                onClick={() => navigate(`/product/kshs {relatedProduct.id}`)}
                              >View</Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </section>
      </div>*/}
    </div>
  );
};