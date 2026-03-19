import { Game } from "./game/Game";

const game = new Game();

game.start();

game.move("e2", "e4");
game.move("e7", "e5");

console.log("Game History: ");
console.log(game.moveHistory);
