import { Game } from "./game/Game";

const game = new Game();

game.start();
game.move("e2", "e4");
game.move("e7", "e5");
game.move("g1", "f3");
game.move("b8", "c6");
game.move("f1", "c4");

console.log("Game History: ");
console.log(game.moveHistory);

console.log("Board State: ");
game.board.print();
