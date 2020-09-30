class BlackjackRL {
    constructor(){
        this.p = [];
        this.q = [];
        this.state = null;
        this.dealerState = null;
        this.env = new Environment();
        this.actions = ["stick", "hit"];
        this.EPSILON = 0.1;
        this.GAMMA = 0.5;
        this.ALPHA = 0.6;
        this.init();
    }

    init() {
        // startNewHand();


        // initialize state space with policy(p) and values(q)
        let pS;                               // Player's current sum
        let dC;                               // Dealer's current up card
        let sA;                               // possible actions ([0] = stick, [1] = hit)
        let a;                                // whether or not player has an ace ([0] = no ace, [1] = yes ace)
        let count = 0;
        for (pS = 0; pS <= 31; pS++) {     
            this.q[pS] = [];
            this.p[pS] = [];
            for (dC = 1; dC <= 10; dC++) {
                this.q[pS][dC] = [];
                this.p[pS][dC] = [];   
                for (sA = 0; sA <= 1; sA++) {
                    this.q[pS][dC][sA] = [];
                    this.p[pS][dC][sA] = [];
                    for (a = 0; a <= 1; a++) {     
                        this.q[pS][dC][sA][a] = 1;
                        this.p[pS][dC][sA][a] = 1 / 2;
                        count++;
                    }
                }
            }
        }
    }

}