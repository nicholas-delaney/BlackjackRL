import java.util.Random;

public class Environment {
	int[] deck = { 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5,
						6, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10,
						10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 };
	String[] actions = {"Hit" , "Stick"};       // actions[0] = "hit", actions[1] = "stick"
	int[] playerHand = new int[3];              // value total, dealer's card, soft ace
	int[] dealerHand = new int[2];

	public Environment() {};

	public String[] getActions() {
		return actions;
	}
	
	public int[] dealCard() {
		int[] card = new int[2];
		int cardValue = -1;
		int index = -2;
			
		// Deal a random card from the deck
		while (cardValue == -1) {
			index = new Random().nextInt(deck.length);
			cardValue = deck[index];
		}
		card[0] = cardValue;

		// Check if card dealt was an ace
		if (card[0] == 1) {                     
			card[1] = 1;                                 
		}
		else {
			card[1] = 0;
		}
		
		deck[index] = -1;
		return card;
		}

	public double getReward(int cardValue, int dTopCard, int soft, int action) {
	
		if (actions[action] == "Stick") {
			if (soft > 0) {
				if (cardValue + 10 > cardValue && cardValue + 10 <= 21) {
					cardValue += 10;
				}
			}
			return dealerTurn(cardValue, dTopCard);
		}
		else if (cardValue > 21) {     
			return -1.0;
		}
		else if (cardValue == 21 || cardValue == 11 && soft > 1) {             
			return 1.5;
		}
		else {                                                                                   
			return 0;                                                                            
		}
	}

	public double dealerTurn(int cV, int dT) {

		int dealerValue = dT;
		int dealerAce = 0;
		if (dealerValue == 1) {
			dealerAce += 1;
		}
		
		while ( dealerValue <= 17 ) {
			// Deal the dealer one card
			int[] newCard = dealCard();
			dealerValue += newCard[0];
			if (dealerAce == 0 && newCard[1] == 1) {
				dealerAce = 1;
			}
			// Check for win or lose.
			if (dealerValue > 21) {
				return 1.0;

			}
			else if (dealerValue > cV) {
				return -1.0;
			}
			else if (dealerAce == 1 && dealerValue + 10 > cV) {
				return -1.0;
			}
		
		}
		return 1;
	}

	public Environment shuffleDeck() {
		Environment env = new Environment();
		return env;
	}

}