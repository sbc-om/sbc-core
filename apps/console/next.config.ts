import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@sbc/ui", "@sbc/kernel", "@sbc/auth", "@sbc/rbac", "@sbc/database", "@sbc/events", "@sbc/sdk", "@sbc/module-base", "@sbc/module-iam"],
};

export default nextConfig;
