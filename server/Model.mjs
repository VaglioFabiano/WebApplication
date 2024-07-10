function Meme(id,name){
    this.id=id;
    this.name=name;
}
function Game(id, user_id, total_score){
    this.id=id;
    this.user_id=user_id;
    this.total_score=total_score;
}
function Round(id, meme_id, caption_id, score, game_id){
    this.id=id;
    this.meme_id=meme_id;
    this.caption_id=caption_id;
    this.score=score;
    this.game_id=game_id;
}
function Caption(id, didascalia){
    this.id=id;
    this.didascalia=didascalia;
}

export {Meme, Game, Round, Caption};