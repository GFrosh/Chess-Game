import { Game } from "./game/Game";

const game = new Game();

game.start();

game.move("e2", "e4");
game.move("d7", "d5");
game.move("e4", "d5");

console.log("Game History: ");
console.log(game.moveHistory);
