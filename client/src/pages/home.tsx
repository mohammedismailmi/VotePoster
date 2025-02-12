import { Card, CardContent } from "@/components/ui/card";
import { PosterGrid } from "@/components/poster-grid";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Plus } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-12 overflow-hidden bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <CardContent className="pt-8 pb-6 px-6">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Poster Voting Platform
                </h1>
                <Link href="/admin">
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Poster
                  </Button>
                </Link>
              </div>
              <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                Vote on your favorite team posters! Each vote shapes the ranking, but choose wisely —
                you can only vote once per poster.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <PosterGrid />
      </div>
    </div>
  );
}