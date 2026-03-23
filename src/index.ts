import { Game } from "./game/Game";

const game = new Game();

game.start();
game.move("e2", "e4");
game.move("d7", "d5");

console.log("Game History: ");
console.log(game.moveHistory);

console.log("Board State: ");
game.board.print();
