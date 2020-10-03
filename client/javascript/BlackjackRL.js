class BlackjackRL {
    constructor() {
        this.p = [];
        this.q = [];
        this.state = {};
        this.dealerState = {};
        this.newRound = true;
        this.env = new Environment();
        this.actions = [0, 1];
        this.EPSILON = 0.5;
        this.GAMMA = 0.2;
        this.ALPHA = 0.3;
        this.init();
    }

    init() {
        // initialize state space with policy(p) and values(q)
        let pS;                               // Player's current sum
        let dC;                               // Dealer's current up card
        let sA;                               // possible actions ([0] = stick, [1] = hit)
        let a;                                // whether or not player has an ace ([0] = no ace, [1] = yes ace)
        for (pS = 1; pS <= 33; pS++) {
            this.q[pS] = [];
            this.p[pS] = [];
            for (dC = 2; dC <= 11; dC++) {
                this.q[pS][dC] = [];
                this.p[pS][dC] = [];
                for (sA = 0; sA <= 1; sA++) {
                    this.q[pS][dC][sA] = [];
                    this.p[pS][dC][sA] = [];
                    for (a = 0; a <= 1; a++) {
                        this.q[pS][dC][sA][a] = 1;
                        this.p[pS][dC][sA][a] = 1 / 2;
                    }
                }
            }
        }
        this.state = this.env.startNewRound();
        for (let i = 0; i < 10000000; i++) {
            this.qLearningIteration();
        }
    }

    qLearningIteration() {
        // Q-Learning steps
        let action = this.getNextAction();
        let nextState = this.getNextState(action);
        let reward = this.env.getReward(nextState, action);
        this.updateValue(nextState, action, reward);
        this.updatePolicy();
        this.state = nextState;
        if (this.env.isRoundOver()) {
            this.state = this.env.startNewRound();
            this.env.setRoundOver(false);
        }
    }

    // select the next action to take based on the policy at the current state
    // returns that action
    getNextAction() {
        // always hit if player score is 11 or less
        let pSum = this.state.pSum;
        if (pSum <= 11) {
            return 1;
        }
        // pick a random action 10% of the time
        let randomNum = Math.floor(Math.random() * 10);
        if (randomNum < (this.EPSILON * 10)) {
            return this.actions[Math.floor(Math.random() * 2)];
        }
        // otherwise pick the 'greedy' action based on current policy
        else {
            let action = -1;
            let softAce = (this.state.softAce > 0) ? 1 : 0;
            let v = -999;
            for (let i in this.actions) {
                if (this.p[this.state.pSum][this.state.dealerCard][softAce][i] >= v) {
                    v = this.p[this.state.pSum][this.state.dealerCard][softAce][i];
                    action = i;
                }
            }
            return Number(action);
        }
    }

    // find next state based on action taken from current state
    getNextState(action) {
        let nextState = {};
        // if player sticks, state stays the same
        if (action === 0) {
            nextState = this.state;
        }
        // if player hits, update state based on the new card
        else if (action === 1) {
            nextState = this.env.playerHit(this.state);
        }
        else {
            console.log("big ol error");
        }
        return nextState;
    }

    updateValue(nextState, action, reward) {
        let maxActionNextState = -999;
        let aces = (nextState.softAce > 0) ? 1 : 0;
        let sAces = (this.state.softAce > 0) ? 1 : 0;
        for (let i in this.actions) {
            if (this.q[nextState.pSum][nextState.dealerCard][aces][i] >= maxActionNextState) {
                maxActionNextState = this.q[nextState.pSum][nextState.dealerCard][aces][i];
            }
        }
        let q = this.q[this.state.pSum][this.state.dealerCard][aces][action];
        this.q[this.state.pSum][this.state.dealerCard][sAces][action] = q + this.ALPHA * (reward + this.GAMMA * maxActionNextState - q);
    }

    updatePolicy() {
        let sAces = (this.state.softAce > 0) ? 1 : 0;
        let maxActionValue = -999;
        let maxActions = [];
        for (let i in this.actions) {
            if (this.q[this.state.pSum][this.state.dealerCard][sAces][i] > maxActionValue) {
                maxActionValue = this.q[this.state.pSum][this.state.dealerCard][sAces][i];
                maxActions = [];
                maxActions.push(Number(i));
            }
            else if (this.q[this.state.pSum][this.state.dealerCard][sAces][i] === maxActionValue) {
                maxActions.push(Number(i));
            }
        }
        for (let i in this.actions) {
            for (let j in maxActions) {
                if (maxActions[j] === this.actions[i]) {
                    this.p[this.state.pSum][this.state.dealerCard][sAces][i] = 1 / maxActions.length;
                }
                else {
                    this.p[this.state.pSum][this.state.dealerCard][sAces][i] = 0;
                }
            }
        }
    }

}