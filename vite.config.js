import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
// base "./" works on Vercel and on GitHub Pages
export default defineConfig({base:"./",plugins:[react()]});
