# Jinx Core v3.A — Railway Build (bcore)

This is a plug-and-deploy build of **Jinx Core** for **Railway** with:
- Express server
- MongoDB integration (Mongoose)
- `/ping` endpoint and internal keep-alive pinger
- Minimal placeholder routes for AI, Music, Translate, and Doubt

## Deploy (Railway)
1. Create a new project on https://railway.app → Deploy from GitHub or upload this folder.
2. Set **Variables**:
   - `PORT=8080`
   - `MONGO_URI=your_mongo_connection_string`
   - `MASTER_KEY=your_master_key`
   - `JWT_SECRET=your_jwt_secret`
   - `APP_URL=https://bcore.up.railway.app`
3. Deploy and open the app URL. You should see: `🧠 Jinx Core v3.A (bcore) running.`

### Endpoints
- `GET /ping` → `pong`
- `POST /jinx/ai/chat` → mock chat response
- `GET /music/search?q=term` → mock results
- `GET /translate?q=text` → reversed string (placeholder)
- `POST /jinx/doubt` → placeholder answer

> Replace placeholders with your real logic from the private repo when ready.
