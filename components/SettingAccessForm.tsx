"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Form schema for validation
const formSchema = z.object({
  accessToken: z
    .string()
    .min(4, { message: "Access token must be at least 4 characters." })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Access token can only contain letters, numbers, and underscores.",
    }),
  webhookUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")),
  notifyPushes: z.boolean().default(true),
  notifyPullRequests: z.boolean().default(true),
  notifyIssues: z.boolean().default(false),
  notifyReleases: z.boolean().default(false),
});
const SettingAccessForm = () => {
  const [showToken, setShowToken] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accessToken: "",
      webhookUrl: "https://api.example.com/webhook",
      notifyPushes: true,
      notifyPullRequests: true,
      notifyIssues: false,
      notifyReleases: false,
    },
  });

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      // In a real app, you would send this data to your backend
      console.log(values);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Settings updated", {
        description: "Your repository settings have been saved successfully.",
      });
    } catch (error) {
      toast.error("Failed to update settings", {
        description: "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Access Settings</CardTitle>
        <CardDescription>Configure access tokens and notification preferences</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Access Token Field */}
            <FormField
              control={form.control}
              name="accessToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub Access Token</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <div className="relative w-full">
                        <Input
                          type={showToken ? "text" : "password"}
                          placeholder="Enter your GitHub access token"
                          className="pr-10" // Add right padding to prevent text overlap with the button
                          {...field}
                        />
                        <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8" onClick={() => setShowToken(!showToken)}>
                          {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span className="sr-only">{showToken ? "Hide token" : "Show token"}</span>
                        </Button>
                      </div>
                    </FormControl>
                  </div>
                  <FormDescription>Your personal access token for GitHub API access.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Webhook URL Field */}
            <FormField
              control={form.control}
              name="webhookUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webhook URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://api.example.com/webhook" {...field} />
                  </FormControl>
                  <FormDescription>The URL where GitHub will send webhook events.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Settings"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default SettingAccessForm;
