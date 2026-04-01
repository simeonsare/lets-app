import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { redirect } from "react-router-dom";
const token = localStorage.getItem("authToken");

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const res = await fetch("/api/whatsappandemail/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(formData),
    });

    // Safely attempt to read JSON error or success response
    const data = await res.json().catch(() => null);

    if (res.ok) {
      toast({
        title: "Message sent",
        description: `Message has been sent. We'll get back as soon as we can.`,
      });
    } else {
      toast({
        title: "Error",
        description:
          data?.detail ||
          data?.error ||
          JSON.stringify(data) ||
          "Could not send message.",
        variant: "destructive",
      });
    }
  } catch (err: any) {
    toast({
      title: "Network Error",
      description: err.message || "Something went wrong.",
      variant: "destructive",
    });
  }
};

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <span>Home</span>
        <span>/</span>
        <span>Contact</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="space-y-6">
          {/* Call To Us */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-destructive rounded-full flex items-center justify-center">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold">Call To Us</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p>We are available 24/7, 7 days a week.</p>
                <p>Phone: +254721108063</p>
              </div>
            </CardContent>
          </Card>

          {/* Write To Us */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-destructive rounded-full flex items-center justify-center">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold">Write To US</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p>Fill out our form and we will contact you within 24 hours.</p>
                <p>Emails: customer@quickstoreYobra.com</p>
                <p>Emails: support@quickstoreYobra.com</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <Input
                    placeholder="Your Name *"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Your Email *"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Your Phone *"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <Textarea
                  placeholder="Your Message"
                  rows={8}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />

                <div className="flex justify-end">
                  <Button type="submit" className="bg-destructive hover:bg-destructive/90">
                    Send Message
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};