import { Layout } from "@/components/Layout";
import { useSocialPosts, useGenerateSocialPosts } from "@/hooks/use-sme";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Facebook, Instagram, Linkedin, RefreshCw, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function SocialManager() {
  const { data: posts, isLoading } = useSocialPosts();
  const { mutate: generate, isPending } = useGenerateSocialPosts();
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "Copied!", description: "Post content copied to clipboard." });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getIcon = (platform: string) => {
    switch(platform.toLowerCase()) {
      case 'facebook': return <Facebook className="w-5 h-5 text-blue-600" />;
      case 'instagram': return <Instagram className="w-5 h-5 text-pink-600" />;
      case 'linkedin': return <Linkedin className="w-5 h-5 text-blue-700" />;
      default: return null;
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Social Media Manager</h1>
            <p className="text-muted-foreground">AI-generated posts tailored for each platform.</p>
          </div>
          <Button onClick={() => generate()} disabled={isPending} size="lg" className="bg-primary hover:bg-primary/90">
            <RefreshCw className={`w-4 h-4 mr-2 ${isPending ? 'animate-spin' : ''}`} />
            Generate New Posts
          </Button>
        </div>

        {!posts?.length && !isLoading && (
          <div className="text-center py-20 bg-white border rounded-xl border-dashed">
            <p className="text-muted-foreground mb-4">No posts generated yet.</p>
            <Button variant="outline" onClick={() => generate()}>Create First Batch</Button>
          </div>
        )}

        <div className="grid gap-6">
          {posts?.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="overflow-hidden">
                <CardHeader className="bg-muted/30 border-b py-3 flex flex-row items-center gap-2">
                  {getIcon(post.platform)}
                  <span className="font-semibold capitalize">{post.platform} Draft</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {new Date(post.createdAt || "").toLocaleDateString()}
                  </span>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="whitespace-pre-wrap text-base leading-relaxed">
                    {post.content}
                  </p>
                </CardContent>
                <CardFooter className="bg-muted/10 border-t py-3 flex justify-end">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyToClipboard(post.content, post.id)}
                  >
                    {copiedId === post.id ? (
                      <Check className="w-4 h-4 mr-2 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2" />
                    )}
                    {copiedId === post.id ? "Copied" : "Copy Content"}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
