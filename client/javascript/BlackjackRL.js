class BlackjackRL {
    constructor() {
        this.p = [];
        this.q = [];
        this.state = {};
        this.dealerState = {};
        this.newRound = true;
        this.env = new Environment();
        this.actions = [0, 1];
        this.EPSILON = 0.3;
        this.GAMMA = 0.0;
        this.ALPHA = 0.5;
        this.stats = { wins: 0, draws: 0, losses: 0 };
        this.totalIterations = 0;
        this.iterationLimit = 1000000;
        this.init();
    }

    init() {
        // initialize state space with policy(p) and values(q)
        let pS;                               // Player's current sum
        let sA;                               // possible actions ([0] = stick, [1] = hit)
        let a;                                // whether or not player has an ace ([0] = no ace, [1] = yes ace)
        for (pS = 1; pS <= 33; pS++) {
            this.q[pS] = [];
            this.p[pS] = [];
            for (sA = 0; sA <= 1; sA++) {
                this.q[pS][sA] = [];
                this.p[pS][sA] = [];
                for (a = 0; a <= 1; a++) {
                    this.q[pS][sA][a] = 1;
                    this.p[pS][sA][a] = 1 / 2;
                }
            }
        }
        this.state = this.env.startNewRound();
    }

// Perform Reinforcement Q - Learning steps
qLearningIteration() {
    // lower chance of taking random action every 1 million iterations
    if (this.totalIterations === this.iterationLimit) {
        this.EPSILON = (this.EPSILON > 0.0) ? this.EPSILON - 0.05 : 0.0;
        this.iterationLimit += 1000000;
    }
    let action = this.getNextAction();                      // Get the next action based on current policy
    let mAction = (action === 1) ? "hit" : "stick";
    //console.log(this.state);
    //console.log("action: " + mAction);
    let nextState = this.getNextState(action);              // Get the next state based on action taken
    //console.log(nextState)
    let reward = this.env.getReward(nextState, action);     // Get the reward from the next state
    //console.log("reward: " + reward);
    let aces = this.state.softAce > 0 ? 1 : 0;
    //console.log(this.q[this.state.pSum][aces][action]);
    this.updateValue(action, reward);                       // update value at current state / action based on reward
    //console.log(this.q[this.state.pSum][aces][action]);
    this.updatePolicy();                                    // update policy at current state 
    // check if round is over and update wins/losses/draws
    //console.log(this.env.isRoundOver());
    //console.log("-------------------------------");
    if (this.env.isRoundOver()) {
        if (reward === 1) {
            this.stats.draws += 1;
        }
        else if (reward === 2) {
            this.stats.wins += 1;
        }
        else if (reward === -1) {
            this.stats.losses += 1;
        }
        this.state = this.env.startNewRound();
        this.env.setRoundOver(false);
    }
    // if round isn't over, set the state for the next iteration
    else {
        this.state = nextState;
    }
    // increment total iterations
    this.totalIterations++;
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
            if (this.p[this.state.pSum][softAce][i] >= v) {
                v = this.p[this.state.pSum][softAce][i];
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
        nextState =  Object.assign({}, this.state);
    }
    // if player hits, update state based on the new card
    else if (action === 1) {
        nextState = this.env.playerHit(this.state);
    }
    return nextState;
}

updateValue(action, reward) {
    let sAces = (this.state.softAce > 0) ? 1 : 0;
    let q = this.q[this.state.pSum][sAces][action];
    this.q[this.state.pSum][sAces][action] = q + this.ALPHA * (reward - q);
}

updatePolicy() {
    let sAces = (this.state.softAce > 0) ? 1 : 0;
    let maxActionValue = -999;
    let maxActions = [];
    for (let i in this.actions) {
        if (this.q[this.state.pSum][sAces][i] > maxActionValue) {
            maxActionValue = this.q[this.state.pSum][sAces][i];
            maxActions = [];
            maxActions.push(Number(i));
        }
        else if (this.q[this.state.pSum][sAces][i] === maxActionValue) {
            maxActions.push(Number(i));
        }
    }
    for (let i in this.actions) {
        for (let j in maxActions) {
            if (maxActions[j] === this.actions[i]) {
                this.p[this.state.pSum][sAces][i] = 1 / maxActions.length;
            }
            else {
                this.p[this.state.pSum][sAces][i] = 0;
            }
        }
    }
}

}