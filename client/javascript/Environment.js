class Environment {
    constructor() {
        this.deck = [];
        this.actions = [];
        this.pHand = [];
        this.dHand = [];
        this.dTopCard = {};
        this.roundOver = false;
        this.init();
    }
    // initialize the environment
    init() {
        // initialize and shuffle the deck
        for (let v = 1; v <= 13; v++) {
            for (let r = 1; r <= 4; r++) {
                this.deck.push({value: v, rank: r});
            }
        }
        this.shuffleDeck();
        // initialize actions: [0] = stick, [1] = hit
        this.actions.push(0, 1);
    }
    // sets up the environment for a new round of blackjack
    startNewRound() {
        this.shuffleDeck();
        this.deal2Cards();
        // find sum of player's hand and how many aces they have
        let aces = 0;
        let sum = 0;
        let cValue = 0;
        for (let i in this.pHand) {
            cValue = (this.pHand[i].value >= 10) ? 10 : this.pHand[i].value;
            if (this.pHand[i].value === 1) {
                cValue = 11;
                aces++;
            }
            sum += cValue;
        }
        let dValue = (this.dHand[1].value >= 10) ? 10 : (this.dHand[1].value === 1) ? 11 : this.dHand[1].value;
        let state = {
            pSum: sum,
            dealerCard: dValue,
            softAce: aces,
        }
        return state;
    }
    // shuffle the deck using the Fisher-Yates shuffle method
    shuffleDeck() {
        // re-initialize the deck
        this.deck = [];
        for (let v = 1; v <= 13; v++) {
            for (let r = 1; r <= 4; r++) {
                this.deck.push({value: v, rank: r});
            }
        }
        // do the shuffle 5 times
        for (let n = 0; n < 5; n++) {
            // Fisher-Yates shuffle method
            for (let i = this.deck.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * i);
                let k = this.deck[i];
                this.deck[i] = this.deck[j];
                this.deck[j] = k;
            }   
        }
    }
    // deal the player and the dealer 2 cards each to start the game
    // check for 'natural win' : the player or the dealer has 21 on first 2 cards
    deal2Cards() {
        this.pHand = [];
        this.dHand = [];
        // deal the dealer and the player 2 cards 
        for (let i = 0; i < 2; i++) {
            this.pHand.push(this.deck.pop());
            this.dHand.push(this.deck.pop());
        }
        // set the dealer top card
        this.dTopCard = this.dHand[1];
        // check for natural win
    }
    // deal one card (return the card from top of the deck)
    dealerHit() {
        return this.deck.pop();
    }

    playerHit(state) {
        // update player hand with new card
        let newCard = this.deck.pop();
        this.pHand.push(newCard);
        // update state with new card
        let cValue = (newCard.value >= 10) ? 10 : (newCard.value === 1) ? 11 : newCard.value;
        state.pSum += cValue;
        state.softAce = (newCard.value === 1) ? state.softAce + 1 : state.softAce;
        return state;
    }

    // get player's reward based on the nextState and the action taken from the previous state
    getReward(nextState, action) {
        // return -1 reward if the player busts, unless they have a usable ace
        if (nextState.pSum > 21) {
            if (nextState.softAce > 0) {
                nextState.pSum -= 10;
                nextState.softAce -= 1;
            }
            else {
                this.setRoundOver(true);
                return -2;
            }
        }
        // if the player sticks (action = 0) or has 21 (blackjack), get reward based on dealer's policy
        if (nextState.pSum === 21 || action === 0) {
            this.setRoundOver(true);
            return this.dealerPolicy(nextState.pSum);
        }
        // return a reward if the player hits and doesn't bust
        else if (action === 1)  {
            return 0;
        }
    }

    // dealer's turn: hit until sum is 17 or greater then check if player or dealer win
    // playerSum : the players total card sum after they stick
    dealerPolicy(playerSum) {
        let dealerSum = 0;
        let cardValue = 0;
        let aces = 0;
        // get the dealer's hand total sum and how many aces they have
        for (let i in this.dHand) {
            cardValue = (this.dHand[i].value > 10) ? 10 : (this.dHand[i].value === 1) ? 11 : this.dHand[i].value;
            aces = (this.dHand[i].value === 1) ? aces + 1 : aces;
            dealerSum += cardValue;
        }
        if (aces === 2) {
            dealerSum = 12;
            aces -= 1;
        } 

        let newCard = {};
        let isBust = false;
        let cValue = 0;
        // dealer keeps getting cards until their sum is 17 or greater
        while (dealerSum < 17) {
            newCard = this.dealerHit();
            this.dHand.push(newCard);
            cValue = newCard.value >= 10 ? 10 :(newCard.value === 1) ? 11 : newCard.value;
            dealerSum += cValue;
            aces = (newCard.value === 1) ? aces + 1 : aces;
            if (dealerSum > 21 && aces > 0) {
                dealerSum -= 10;
                aces -= 1;
            }
        }
        // determine if win, lose or draw for the player (1 = win, 0 = draw, -1 = lose)
        isBust = (dealerSum > 21) ? true : false;
        let reward = (playerSum > dealerSum) ? 2 : (playerSum === dealerSum) ? 0 : (isBust) ? 2 : -1;
        return reward;
    }

    setRoundOver(status) {
        this.roundOver = status;
    }

    isRoundOver() {
        return this.roundOver;
    }
}