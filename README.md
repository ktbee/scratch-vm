## The embed code and instructions

Example code for embedding this player can be found at this URL: [https://gist.github.com/ktbee/e294409662ce838ea8ed6dcd63f31cd7](https://gist.github.com/ktbee/e294409662ce838ea8ed6dcd63f31cd7).

#### To run this player:

1. Copy [this code](https://gist.github.com/ktbee/e294409662ce838ea8ed6dcd63f31cd7) into an index.html file and open it in the browser to see the default project.

2. Try a specific project. There are a couple options for local development, but they have the same observable outcome:
    * Load a local project
        * To load local project files, add the path to the location of your local sb3 file to the canvas element's data-source attribute in this index.html file. For example, if your sb3 file is in the same folder as this index.html file, you can load it with this canvas element: `<canvas class="stage" id="scratch-stage" width="480" height="360" data-source="project-name.sb3"></canvas>`.
        * You can also add a relative path to your URL to load a local project. Just add `?source=path/to/local/project.sb3` to the end of your local page's URL.
        * NB: if you use local sb3 files, you will need a local server to be able to load them. Running the command `npx http-server` in the same folder as this index.html file will give you a local server at localhost:8080 that you can use to load your local files.
    * Load a project from remote servers, CDN.
        * Add `?source=https://projects.scratch.mit.edu/319681786` to the end of your file's URL in the browser. The number at the end is a project ID, which you can change to try different projects.
        * You can also add a CDN URL to the canvas element, and use something like `<canvas class="stage" id="scratch-stage" width="480" height="360" data-source="https://projects.scratch.mit.edu/319681786"></canvas>`
        * This project loading method is just for development, we won't want to use Scratch's servers in the final site.

### Player contents

This is a directory listing of the built contents of our player.

    ├── assets
     │   ├── down.svg
     │   ├── left.svg
     │   ├── playground.sb3
     │   ├── right.svg
     │   └── up.svg
    ├── base.css
    ├── example.index.html
    ├── extension-worker.js
    ├── extension-worker.js.map
    ├── main.min.js
    └── player.css

#### assets

This folder holds images for the virtual key's styling and a default project.

#### example.index.html

This HTML file holds suggested embed code for using the player. The only required elements are commented below:

    <!doctype html>
    <html>
      <head>
        <!-- We've found this viewport tag to be important for avoiding some layout bugs on mobile. Please include it as is. -->
        <meta name="viewport" content="initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, width=device-width">
        <!-- Styling for the player, virtual buttons and the page around it -->
        <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/@bocoup/phoenix-fyre/base.css">
      </head>
      <body class="sw-body">
        <!-- stage-container class is currently required by the player for appending virtual buttons UI -->
        <div class="stage-container">
          <!-- This canvas element loads the Scratch project. The scratch-stage id is required by the player for
          getting the correct canvas element and initializing the player. -->
          <canvas class="stage" id="scratch-stage" width="480" height="360" data-source=""></canvas>
          <!-- Element for showing the hearts captured score -->
          <div id="hearts"></div>
        </div>
        <!-- JavaScript that creates the player in the canvas element and adds virtual buttons -->
      <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@bocoup/phoenix-fyre/main.min.js"></script></body>
    </html>

#### extension-worker.js, extension-worker.js.map

Files for running extensions in web workers

#### main.min.js

Minimized version of all of the JavaScript we need to run the virtual machine and the player itself

### CSS Files

The player is designed to have two sets of styling instructions. `base.css` contains a small amount of styling for the player to maintain Scratch's aspect ratio of 4/3 and also styling for the virtual keys UI. `player.css` is suggested styling for the UI around the player. `player.css` is meant to be optional, if it conflicts with other styles needed for the page.

#### base.css

Minimal styling to maintain the correct aspect ratio for the Scratch player and also style the virtual keys.

#### player.css

Suggested styling for the UI around the player. If you are using this in addition to base.css, make sure it is linked to the page second for intended styling. ie:

    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/@bocoup/phoenix-fyre/phoenix-fyre/base.css">
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/@bocoup/phoenix-fyre/phoenix-fyre/player.css">
