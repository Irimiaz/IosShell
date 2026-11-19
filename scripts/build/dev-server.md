# Dev server and JavaScript changes

JavaScript changes load over the network from the Metro dev server on your Mac, with no rebuild needed. Native changes always need `npm run ios:device`.

## Access the app from the iPhone

The JavaScript loads over the network, so the phone and the Mac need to be able to reach each other.

1. On the Mac, start the dev server and leave it running:

   ```bash
   npm start
   ```

2. Put the iPhone on the **same Wi-Fi network** as the Mac. Make sure the Mac's firewall does not block incoming connections on port 8081.
3. Open the app on the iPhone. It connects to the Metro server and loads the JavaScript. Changes you save on the Mac reload on the phone with fast refresh.
4. If the app shows "Unable to connect to Metro" or a blank screen, check these in order:
   - `npm start` is running on the Mac, and nothing else is using port 8081.
   - Both devices are on the same Wi-Fi. A guest network or a VPN on either device can block the connection.
   - Use the tunnel when the networks differ or local discovery fails:

     ```bash
     npm run ios:tunnel
     ```

5. Native changes (new packages, `app.json`, plugins, bundle identifier) need a rebuild on each phone with `npm run ios:device`. JavaScript changes do not.
