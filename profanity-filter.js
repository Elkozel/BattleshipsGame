var profanityFilter = {
    words: [],
    checkWord(word, next){
        for(s in this.words){
            if(word === s)
                next();
        }
    },
    addWord(word){
        this.words.push(word);
    },
    addWords(words){
        for(s in words){
            this.addWord(s);
        }
    }
}