import tkinter as tk
from tkinter import messagebox
import random


someWords = {
    "Fruits": ['apple', 'banana', 'mango', 'strawberry', 'orange', 'grape', 'pineapple',
                'apricot', 'lemon', 'coconut', 'watermelon', 'cherry', 'papaya', 'berry',
                'peach', 'lychee', 'muskmelon'],
    "Animals": ['lion', 'tiger', 'elephant', 'monkey', 'giraffe', 'zebra', 'kangaroo',
                 'panda', 'dolphin', 'cheetah', 'rabbit', 'wolf', 'bear', 'fox', 'deer'],
    "Countries": ['india', 'canada', 'germany', 'france', 'brazil', 'australia',
                   'japan', 'china', 'italy', 'russia', 'mexico', 'spain', 'egypt']
}

class LetterLink:
    def __init__(self, root):
        self.root = root
        self.root.title("Letter Link")
        
        self.category, self.word = self.get_random_word()
        self.letterGuessed = set()
        self.chances = len(self.word) + 2
        
        self.label_hint = tk.Label(root, text="Guess the word! HINT: " + self.category, font=("Arial", 14))
        self.label_hint.pack(pady=10)
        
        self.display_var = tk.StringVar()
        self.update_display()
        self.label_word = tk.Label(root, textvariable=self.display_var, font=("Arial", 16))
        self.label_word.pack(pady=10)
        
        self.label_chances = tk.Label(root, text="Chances left: " + str(self.chances), font=("Arial", 12))
        self.label_chances.pack(pady=5)
        
        self.entry_guess = tk.Entry(root, font=("Arial", 14))
        self.entry_guess.pack(pady=5)
        
        self.button_guess = tk.Button(root, text="Guess", command=self.process_guess)
        self.button_guess.pack(pady=10)

    def get_random_word(self):
        category = random.choice(list(someWords.keys()))
        word = random.choice(someWords[category])
        return category, word
    
    def update_display(self):
        display_word = " ".join([char if char in self.letterGuessed else "_" for char in self.word])
        self.display_var.set(display_word)
    
    def process_guess(self):
        guess = self.entry_guess.get().lower()
        self.entry_guess.delete(0, tk.END)
        
        if not guess.isalpha() or len(guess) != 1:
            messagebox.showerror("Invalid Input", "Enter a single valid letter.")
            return
        
        if guess in self.letterGuessed:
            messagebox.showinfo("Duplicate", "You already guessed that letter.")
            return
        
        self.letterGuessed.add(guess)
        self.chances -= 1
        self.label_chances.config(text="Chances left: " + str(self.chances))
        self.update_display()
        
        if set(self.word) <= self.letterGuessed:
            messagebox.showinfo("Congratulations", "You won! The word was: " + self.word)
            self.root.quit()
        elif self.chances == 0:
            messagebox.showinfo("Game Over", "You lost! The word was: " + self.word)
            self.root.quit()

root = tk.Tk()
game = LetterLink(root)
root.mainloop()
