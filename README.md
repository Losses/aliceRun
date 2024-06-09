<div style="text-align: center; background: black; color: white">
<img src="https://github.com/Losses/aliceRun/blob/master/assets/title.gif?raw=true" alt="Alice Run" />
<h1>Alice Run</h1>
<p>さよなら、大切なもの。</p>
</div>

## Project Overview

Alice Run combines motion-sensing games and visual novels. Users engage in ultra-slow jogging using Joy-Con controllers, with the on-screen character moving in sync and the storyline unfolding alongside. The project's initial goal was to meet the author's need for an ideal "controlled aerobic exercise" and to gamify the exercise process, creating a positive feedback loop.

## Key Features

- **Motion Control**: Detects user steps through Joy-Con and synchronizes the on-screen character's movements.
- **Visual Novel**: Users experience a gradually unfolding storyline while exercising.
- **Exercise Statistics**: Records user exercise data, including steps and exercise time, and provides detailed statistical reports.
- **Multiplayer Mode**: Supports two users exercising simultaneously, offering both competitive and cooperative game modes.

## Installation and Running

### Environment Requirements

- Node.js
- Yarn package manager

### Installation Steps

1. Clone the project code:

    ```bash
    git clone https://github.com/losses/aliceRun.git
    cd aliceRun
    ```

2. Install dependencies:

    ```bash
    yarn install
    ```

3. Start the development server:

    ```bash
    yarn start
    ```

4. Build the project:

    ```bash
    yarn build
    ```

## Usage Instructions

1. Connect the Joy-Con controllers to the PC.
2. Open a browser and visit the development server address.
3. Choose story mode or free mode to start exercising.
4. During exercise, the on-screen character will move in sync with you, accompanied by the unfolding storyline.
5. After exercising, you can view detailed exercise statistics.

## Project Structure

- `src/`: Source code directory, including core logic, rendering, audio processing, and other modules.
- `static/`: Static resources directory, including images, audio, and other resources.
- `index.html`: Entry HTML file.
- `package.json`: Project dependencies and script configurations.

## Contribution Guidelines

Suggestions and code contributions to this project are welcome. Please submit a Pull Request or Issue, and we will address it promptly.

## License

This project is licensed under the GPLv3 License. For more details, please refer to the LICENSE file.