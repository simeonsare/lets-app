import { toast } from "@/components/ui/use-toast";


const token = localStorage.getItem('authToken');


export function toggelwishlist(productId: number, name: string ) {
  fetch(`/api/wishlist/`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`,
                  },
                  credentials: "include", 
                  body: JSON.stringify({
                    product_id: productId, // make sure your backend expects this key
                    quantity: 1,
                  }),
                })
                  .then((res) => {
                    if (!res.ok) {
                      throw new Error("Failed to add to wishlist");
                    }
                    return res.json();
                  })
                  .then((data) => {
                    toast({
                      title: "Added to wishlist",
                      description: `${name} has been ${data.message} `,
                    });
                  })
                  .catch((err) => {
                    console.error(err);
                    toast({
                      title: "Error",
                      description: "Could not add product to wishlist. Check if you're logged in and refresh the page.",
                      variant: "destructive",
                    });
                  });
                  setTimeout(() => {
        window.location.href = "/wishlist"; 
        window.location.reload();
      }, 100);
                }
