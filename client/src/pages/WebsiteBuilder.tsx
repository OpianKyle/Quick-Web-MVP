import { Layout } from "@/components/Layout";
import { useWebsiteDraft, useGenerateWebsite, usePublishWebsite } from "@/hooks/use-sme";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Globe, LayoutTemplate, Palette, Rocket } from "lucide-react";
import { motion } from "framer-motion";

export default function WebsiteBuilder() {
  const { data: draft, isLoading } = useWebsiteDraft();
  const { mutate: generate, isPending: isGenerating } = useGenerateWebsite();
  const { mutate: publish, isPending: isPublishing } = usePublishWebsite();

  const styles = [
    { id: "modern", name: "Modern Corporate", color: "bg-slate-900" },
    { id: "creative", name: "Creative Studio", color: "bg-purple-600" },
    { id: "retail", name: "Retail Store", color: "bg-orange-500" },
  ];

  if (isLoading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold">Website Builder</h1>
            <p className="text-muted-foreground">AI-powered website generation for your business.</p>
          </div>
          {draft && !draft.isPublished && (
            <Button 
              size="lg" 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => publish(draft.slug || "mysite")}
              disabled={isPublishing}
            >
              <Rocket className="w-4 h-4 mr-2" />
              {isPublishing ? "Publishing..." : "Publish Live"}
            </Button>
          )}
          {draft?.isPublished && (
             <Button variant="outline" className="border-green-600 text-green-600">
               <Globe className="w-4 h-4 mr-2" />
               View Live Site
             </Button>
          )}
        </div>

        {!draft ? (
          <Card className="p-12 text-center border-dashed border-2">
             <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
               <LayoutTemplate className="w-10 h-10 text-primary" />
             </div>
             <h2 className="text-2xl font-bold mb-4">Let's build your website</h2>
             <p className="text-muted-foreground mb-8 max-w-md mx-auto">
               Choose a style below and our AI will generate a complete website based on your business profile.
             </p>
             
             <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
               {styles.map((style) => (
                 <motion.button
                   key={style.id}
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={() => generate(style.id)}
                   disabled={isGenerating}
                   className="group relative overflow-hidden rounded-xl border aspect-[4/3] flex flex-col items-center justify-center bg-white shadow-sm hover:shadow-xl transition-all"
                 >
                   <div className={`absolute inset-0 opacity-10 ${style.color}`} />
                   <Palette className="w-8 h-8 mb-3 text-foreground" />
                   <span className="font-semibold">{style.name}</span>
                   {isGenerating && <div className="absolute inset-0 bg-white/50 flex items-center justify-center"><Loader2 className="animate-spin" /></div>}
                 </motion.button>
               ))}
             </div>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl border shadow-lg overflow-hidden min-h-[600px] flex flex-col">
                <div className="bg-slate-100 border-b p-3 flex gap-2 items-center">
                   <div className="flex gap-1.5">
                     <div className="w-3 h-3 rounded-full bg-red-400" />
                     <div className="w-3 h-3 rounded-full bg-yellow-400" />
                     <div className="w-3 h-3 rounded-full bg-green-400" />
                   </div>
                   <div className="bg-white rounded-md px-3 py-1 text-xs text-muted-foreground flex-1 text-center mx-4">
                     your-business.smmesa.gov.za
                   </div>
                </div>
                
                {/* Website Preview Mockup */}
                <div className="flex-1 overflow-y-auto p-8 font-sans">
                  {/* Hero Section */}
                  <div className="text-center py-16 px-4 bg-slate-50 rounded-2xl mb-12">
                     <h1 className="text-4xl font-bold mb-4">{(draft.content as any).hero?.title || "Business Name"}</h1>
                     <p className="text-xl text-slate-600 mb-8">{(draft.content as any).hero?.subtitle || "We provide excellent services."}</p>
                     <Button>Contact Us</Button>
                  </div>
                  
                  {/* Services Grid */}
                  <div className="grid md:grid-cols-3 gap-8 mb-16">
                    {((draft.content as any).services || [1,2,3]).map((s: any, i: number) => (
                      <div key={i} className="p-6 border rounded-xl">
                        <h3 className="font-bold text-lg mb-2">Service {i+1}</h3>
                        <p className="text-slate-600 text-sm">Professional quality service tailored to your needs.</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Editor Tools</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">Change Colors</Button>
                  <Button variant="outline" className="w-full justify-start">Edit Content</Button>
                  <Button variant="outline" className="w-full justify-start">SEO Settings</Button>
                </div>
              </Card>
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => generate("modern")} // Regenerate
                disabled={isGenerating}
              >
                Regenerate Site
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
