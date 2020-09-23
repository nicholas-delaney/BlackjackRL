import java.util.ArrayList;
import java.util.Random;

public class BJRL {

	private double[][][][] P;                 // = [card value][dealers top card][softace?][action]
	private double[][][][] Q;
	private int[] state;                     // = [card total, dealer's top card, count of aces]        
	private int[] dealerState;               // = [card total, soft ace?]
	private Environment env;
	private String[] actions;
	private final double EPSILON;
	private final double GAMMA;
	private final double ALPHA;
	
	public BJRL() {
		
		Q = new double[32][11][2][2];   
		P = new double[32][11][2][2];
		state = new int[3];
		dealerState = new int[2];
		env = new Environment();
		actions = env.getActions();
		EPSILON = 0.1;
		GAMMA = 0.5;
		ALPHA = 0.6;
		
		startNewHand();
		
		// Initialize policy and values
		for (int s = 0; s < 31; s++) {
			for (int d = 0; d < 11; d++) {
				for (int a = 0; a < 2; a++) {
					for (int i = 0; i < env.actions.length; i++) {
						Q[s][d][a][i] = 0;
						P[s][d][a][i] = 1.0/env.actions.length;
					}
				}
			}
		}
		
		
	}
	
	public void startNewHand() {
		// deal player 2 cards
		int[] card = env.dealCard();
		state[0] = card[0];
		state[2] = card[1];
		card = env.dealCard();
		state[0] += card[0];
		if (state[2] == 0 && card[1] == 1) {
			state[2] = 1;
		}
	
		// show the dealer's top card
		card = env.dealCard();
		dealerState = card;
		state[1] = dealerState[0];
		
		
	}
	
	public void QLearningIteration() {
		
		for (int i = 0; i < 1000; i++) {
		
		int action = selectActionFromPolicy(state);
		int[] nextState = getNextState(state[0], state[1], state[2], action);
		double reward = env.getReward(nextState[0], nextState[1], nextState[2], action);
		updateValue(nextState, action, reward);
		updatePolicy();
		
		OutputState(action, reward);
		
		state = nextState;	
		if (actions[action] == "Stick" || state[0] >= 21) {
			env = new Environment();
			startNewHand();
		}
		
		}
		
	}
	
	public void updateValue(int[] nextState, int action, double reward) {
		
		double maxAnextState = -999999999;
		for (int a=0; a<actions.length; a++)
		{
			if (Q[nextState[0]][nextState[1]][nextState[2]][a] >= maxAnextState) { maxAnextState = Q[nextState[0]][nextState[1]][nextState[2]][a]; }
					
		}        
		
		Q[state[0]][state[1]][state[2]][action] = Q[state[0]][state[1]][state[2]][action] + ALPHA*(reward + GAMMA * maxAnextState - Q[state[0]][state[1]][state[2]][action]);
    		
	}
	
	public void updatePolicy() {
		double maxActionValue = -999999999;
		ArrayList<Integer> maxActions = new ArrayList<Integer>();

		for (int i=0; i<actions.length; i++) 
		{
			if (Q[state[0]][state[1]][state[2]][i] >  maxActionValue)
			{
				maxActionValue = Q[state[0]][state[1]][state[2]][i];
				maxActions.clear();
				maxActions.add(i);
			}
			else if (Q[state[0]][state[1]][state[2]][i] ==  maxActionValue) 
			{
				maxActions.add(i);
			}
		}
		
		for (int i=0; i<actions.length; i++)
		{
			if (maxActions.contains(i)) { P[state[0]][state[1]][state[2]][i] = 1.0/maxActions.size(); }
			else       			        { P[state[0]][state[1]][state[2]][i] = 0; }
			
		}
		
	}
	
	public int selectActionFromPolicy(int[] state) {
		String[] actions = env.getActions();
		
		if (new Random().nextDouble() < EPSILON ) {
			return new Random().nextInt(actions.length);
		}
		else {
			double randNum = new Random().nextDouble();
			double offSet = 0;
			for (int i = 0; i < actions.length; i++) {
				if (randNum < P[state[0]][state[1]][state[2]][i] + offSet) {
					return i;
				}
				offSet +=  P[state[0]][state[1]][state[2]][i];
			}
			
		}
		return -1;                        // an error has occured 
	}
	
	public int[] getNextState(int cardValue, int dTopCard, int softAce, int action) {
		String[] actions = env.getActions();
		int[] nextState = new int[3];
		nextState[1] = dTopCard;
		
		// Deal new card
		if (actions[action] == "Hit") {
			int[] newCard = env.dealCard();
			nextState[0] = cardValue + newCard[0];
			if (softAce == 0 && newCard[1] == 1) {
				nextState[2] = 1;
			}
			else if (softAce > 1 && newCard[1] == 1) {
				nextState[2] += 1;
			}
			else {
				nextState[2] = 0;
			}
		}
		else if (actions[action] == "Stick") {
			nextState[0] = cardValue;
			nextState[2] = softAce;
		}
		return nextState;
	}
	
	public void OutputState(int a, double r) {
		
		GUI.gameArea.append("Player's Hand: " + "[" + state[0] + "]" + "\n");
		GUI.gameArea.append("Dealer's Top Card: " + "[" + state[1] + "]" + "\n");
		GUI.gameArea.append("Action: " + actions[a] + "\n" + "Reward: " + r + "\n\n");
	
	}
	
	public void OutputPolicy() {

		for (int s = 0; s < 21; s++) {
			for (int d = 0; d < 11; d++) {
				for (int a = 0; a < 2; a++) {
					for (int i = 0; i < env.actions.length; i++) {
						GUI.gameArea.append("Policy: " + "\n");
						GUI.gameArea.append("Card value: " + s + " Dealer up card: " + d + "Soft ace: " + a + "\n");
						GUI.gameArea.append("Action: " + i + " Policy:" + Double.toString(P[s][d][a][i]) + " Value:" + Double.toString(Q[s][d][a][i]));
						GUI.gameArea.append("\n");
						GUI.gameArea.append("\n");
						GUI.gameArea.append("\n");						
					}
				}
			}
		}
	}
	 
}