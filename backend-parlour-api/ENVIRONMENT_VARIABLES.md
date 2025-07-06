# Backend Environment Variables for Vercel Deployment

## Required Environment Variables

Configure these in your Vercel project settings:

### Database
- `MONGODB_URI`: Your MongoDB Atlas connection string
  - Current: `mongodb+srv://pratik:zenitsu@cluster0.4smyu.mongodb.net/parlour-db?retryWrites=true&w=majority`
  - **Important**: For production, use a separate database with proper credentials

### JWT Configuration
- `JWT_SECRET`: Secret key for JWT token signing
  - Default: `your-super-secret-jwt-key`
  - **Important**: Use a strong, unique secret in production

- `JWT_EXPIRES_IN`: JWT token expiration time
  - Default: `7d`
  - Example: `24h`, `7d`, `30d`

### Frontend URL (CORS)
- `FRONTEND_URL`: Your frontend application URL
  - Development: `http://localhost:3000`
  - Production: Your deployed frontend URL (e.g., `https://your-frontend.vercel.app`)

### Server Configuration
- `PORT`: Server port (Vercel will set this automatically)
- `NODE_ENV`: Environment mode
  - Development: `development`
  - Production: `production`

## Vercel Configuration

The `vercel.json` file is already configured to:
- Build the TypeScript code to `dist/` directory
- Use `@vercel/node` runtime
- Route all requests to the compiled server
- Set function timeout to 30 seconds

## Deployment Steps

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set the environment variables in Vercel project settings
4. Deploy

## Security Notes

- Never commit `.env` files to version control
- Use strong, unique secrets for JWT_SECRET
- Consider using Vercel's built-in environment variable encryption
- Use separate databases for development and production 