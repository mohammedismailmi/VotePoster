import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export default function Admin() {
  const [teamName, setTeamName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleImageError = () => {
    toast({
      title: "Image Loading Error",
      description: "Unable to load the image. Please check the URL and try again.",
      variant: "destructive",
    });
  };

  const createPosterMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/posters', {
        teamName,
        imageUrl
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/posters'] });
      toast({
        title: "Success",
        description: data.message,
      });
      setTeamName("");
      setImageUrl("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Add New Poster</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => {
            e.preventDefault();
            createPosterMutation.mutate();
          }} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="teamName">Team Name</Label>
              <Input
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Enter image URL"
                required
              />
            </div>

            {imageUrl && (
              <div className="space-y-2">
                <Label>Image Preview</Label>
                <Card className="overflow-hidden">
                  <AspectRatio ratio={16 / 9}>
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="object-cover w-full h-full"
                      onError={handleImageError}
                    />
                  </AspectRatio>
                </Card>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={createPosterMutation.isPending}
              >
                Add Poster
              </Button>
              <Link href="/">
                <Button
                  type="button"
                  variant="outline"
                >
                  View All Posters
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}