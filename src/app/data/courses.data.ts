export type Level = 'Easy' | 'Medium' | 'Hard';

export interface Question {
    text: string;
    level: Level;
}

export interface Module {
    title: string;
    topics: string[];
}

export interface Course {
    id: string;
    name: string;
    curriculum: Module[];
    questions: Question[];
}

export const COURSES: Course[] = [{
  id: 'java',
  name: 'Core Java (45 Days)',
  curriculum: [

    {
      title: "Week 1: Java Foundations",
      topics: [
        "Day 1: Introduction to Java, JDK installation, IDE setup, Hello World",
        "Day 2: Variables and Data Types (int, float, double, char, boolean, String)",
        "Day 3: Operators (Arithmetic, Relational, Logical, Assignment, Unary)",
        "Day 4: Strings and String methods",
        "Day 5: Input/Output, Scanner class, Comments, Debugging",
        "Day 6: Conditional statements (if, else, nested if)",
        "Day 7: Practice - Basic problem solving"
      ]
    },

    {
      title: "Week 2: Control Flow & Methods",
      topics: [
        "Day 8: While loop, break, continue",
        "Day 9: For loop, nested loops",
        "Day 10: Methods introduction and usage",
        "Day 11: Parameters and return types",
        "Day 12: Method overloading",
        "Day 13: Variable scope (local, instance, static)",
        "Day 14: Practice - Loops & methods"
      ]
    },

    {
      title: "Week 3: Arrays & Strings",
      topics: [
        "Day 15: Arrays basics",
        "Day 16: Array operations",
        "Day 17: 2D arrays",
        "Day 18: StringBuffer & StringBuilder",
        "Day 19: Advanced string operations",
        "Day 20: Searching (Linear, Binary)",
        "Day 21: Practice - Arrays & strings"
      ]
    },

    {
      title: "Week 4: Object-Oriented Programming",
      topics: [
        "Day 22: OOP concepts",
        "Day 23: Classes & Objects",
        "Day 24: Constructors",
        "Day 25: Inheritance",
        "Day 26: Polymorphism",
        "Day 27: Encapsulation & Abstraction",
        "Day 28: Practice - OOP"
      ]
    },

    {
      title: "Week 5: Collections - List",
      topics: [
        "Day 29: Collections Framework intro",
        "Day 30: List & ArrayList",
        "Day 31: ArrayList operations",
        "Day 32: LinkedList",
        "Day 33: ArrayList vs LinkedList",
        "Day 34: Vector & Stack",
        "Day 35: Practice - List problems"
      ]
    },

    {
      title: "Week 6: Collections - Set",
      topics: [
        "Day 36: Set interface",
        "Day 37: HashSet",
        "Day 38: LinkedHashSet",
        "Day 39: TreeSet",
        "Day 40: Set comparison",
        "Day 41: Iterators",
        "Day 42: Practice - Set problems"
      ]
    },

    {
      title: "Week 7: Map & Advanced",
      topics: [
        "Day 43: Map interface",
        "Day 44: HashMap",
        "Day 45: LinkedHashMap & TreeMap",
        "Day 46: Map iteration",
        "Day 47: Frequency counting",
        "Day 48: Collections utility",
        "Day 49: Final revision"
      ]
    }
    ],

    questions: [

        // ===== ARRAY & TWO POINTER (1–20) =====
        { text: "Two Sum", level: "Easy" },
        { text: "Two Sum II (Sorted Input)", level: "Easy" },
        { text: "3Sum", level: "Medium" },
        { text: "4Sum", level: "Medium" },
        { text: "3Sum Closest", level: "Medium" },
        { text: "Container With Most Water", level: "Medium" },
        { text: "Trapping Rain Water", level: "Hard" },
        { text: "Remove Duplicates from Sorted Array", level: "Easy" },
        { text: "Remove Duplicates II", level: "Medium" },
        { text: "Remove Element", level: "Easy" },
        { text: "Move Zeroes", level: "Easy" },
        { text: "Minimum Size Subarray Sum", level: "Medium" },
        { text: "Sort Colors (Dutch Flag Problem)", level: "Medium" },
        { text: "Merge Sorted Array", level: "Easy" },
        { text: "Find Pivot Index", level: "Easy" },
        { text: "Rotate Array", level: "Medium" },
        { text: "Best Time to Buy and Sell Stock", level: "Easy" },
        { text: "Best Time to Buy and Sell Stock II", level: "Medium" },
        { text: "Jump Game", level: "Medium" },
        { text: "Jump Game II", level: "Hard" },

        // ===== BINARY SEARCH (21–30) =====
        { text: "Binary Search", level: "Easy" },
        { text: "Search Insert Position", level: "Easy" },
        { text: "Find Minimum in Rotated Sorted Array", level: "Medium" },
        { text: "Search in Rotated Sorted Array", level: "Medium" },
        { text: "Search in Rotated Sorted Array II", level: "Hard" },
        { text: "Median of Two Sorted Arrays", level: "Hard" },
        { text: "Find Peak Element", level: "Medium" },
        { text: "First Bad Version", level: "Easy" },
        { text: "Search a 2D Matrix", level: "Medium" },
        { text: "Sqrt(x)", level: "Easy" },

        // ===== STRINGS (31–50) =====
        { text: "Valid Palindrome", level: "Easy" },
        { text: "Longest Substring Without Repeating Characters", level: "Medium" },
        { text: "Longest Palindromic Substring", level: "Medium" },
        { text: "Group Anagrams", level: "Medium" },
        { text: "Minimum Window Substring", level: "Hard" },
        { text: "Valid Anagram", level: "Easy" },
        { text: "Isomorphic Strings", level: "Easy" },
        { text: "Word Pattern", level: "Easy" },
        { text: "String to Integer (atoi)", level: "Medium" },
        { text: "Reverse Words in a String", level: "Medium" },
        { text: "Implement strStr()", level: "Easy" },
        { text: "Longest Common Prefix", level: "Easy" },
        { text: "ZigZag Conversion", level: "Medium" },
        { text: "Wildcard Matching", level: "Hard" },
        { text: "Regular Expression Matching", level: "Hard" },
        { text: "Decode String", level: "Medium" },
        { text: "Count and Say", level: "Easy" },
        { text: "Palindrome Partitioning", level: "Medium" },
        { text: "Palindrome Partitioning II", level: "Hard" },
        { text: "Shortest Palindrome", level: "Hard" },

        // ===== STACK & QUEUE (51–60) =====
        { text: "Valid Parentheses", level: "Easy" },
        { text: "Min Stack", level: "Medium" },
        { text: "Evaluate Reverse Polish Notation", level: "Medium" },
        { text: "Largest Rectangle in Histogram", level: "Hard" },
        { text: "Maximal Rectangle", level: "Hard" },
        { text: "Implement Queue using Stacks", level: "Easy" },
        { text: "Implement Stack using Queues", level: "Easy" },
        { text: "Daily Temperatures", level: "Medium" },
        { text: "Sliding Window Maximum", level: "Hard" },
        { text: "Simplify Path", level: "Medium" },

        // ===== LINKED LIST (61–70) =====
        { text: "Reverse Linked List", level: "Easy" },
        { text: "Merge Two Sorted Lists", level: "Easy" },
        { text: "Linked List Cycle", level: "Easy" },
        { text: "Detect Cycle II", level: "Medium" },
        { text: "Remove Nth Node From End", level: "Medium" },
        { text: "Add Two Numbers", level: "Medium" },
        { text: "Intersection of Two Linked Lists", level: "Easy" },
        { text: "Sort List", level: "Medium" },
        { text: "Merge K Sorted Lists", level: "Hard" },
        { text: "Copy List with Random Pointer", level: "Hard" },

        // ===== HASHING (71–80) =====
        { text: "Contains Duplicate", level: "Easy" },
        { text: "Contains Duplicate II", level: "Easy" },
        { text: "Contains Duplicate III", level: "Medium" },
        { text: "Two Sum (HashMap)", level: "Easy" },
        { text: "Subarray Sum Equals K", level: "Medium" },
        { text: "Longest Consecutive Sequence", level: "Medium" },
        { text: "Happy Number", level: "Easy" },
        { text: "Intersection of Two Arrays", level: "Easy" },
        { text: "Isomorphic Strings", level: "Easy" },
        { text: "Top K Frequent Elements", level: "Medium" },

        // ===== HEAP / PRIORITY QUEUE (81–90) =====
        { text: "Kth Largest Element in Array", level: "Medium" },
        { text: "Merge K Sorted Lists (Heap)", level: "Hard" },
        { text: "Find Median from Data Stream", level: "Hard" },
        { text: "Top K Frequent Words", level: "Medium" },
        { text: "Reorganize String", level: "Medium" },
        { text: "Task Scheduler", level: "Medium" },
        { text: "Last Stone Weight", level: "Easy" },
        { text: "K Closest Points to Origin", level: "Medium" },
        { text: "Sliding Window Median", level: "Hard" },
        { text: "Smallest Range Covering Elements", level: "Hard" },

        // ===== GRAPH (91–110) =====
        { text: "Clone Graph", level: "Medium" },
        { text: "Course Schedule", level: "Medium" },
        { text: "Course Schedule II", level: "Medium" },
        { text: "Number of Islands", level: "Medium" },
        { text: "Flood Fill", level: "Easy" },
        { text: "Word Ladder", level: "Hard" },
        { text: "Word Ladder II", level: "Hard" },
        { text: "Graph Valid Tree", level: "Medium" },
        { text: "Minimum Height Trees", level: "Medium" },
        { text: "Network Delay Time", level: "Medium" },
        { text: "Dijkstra Algorithm Implementation", level: "Hard" },
        { text: "Bellman-Ford Algorithm", level: "Hard" },
        { text: "Detect Cycle in Graph", level: "Medium" },
        { text: "Topological Sort", level: "Medium" },
        { text: "Reconstruct Itinerary", level: "Hard" },
        { text: "Accounts Merge", level: "Medium" },
        { text: "Alien Dictionary", level: "Hard" },
        { text: "Bipartite Graph Check", level: "Medium" },
        { text: "Shortest Path in Grid", level: "Medium" },
        { text: "Number of Connected Components", level: "Medium" },

        // ===== DYNAMIC PROGRAMMING (111–140) =====
        { text: "Climbing Stairs", level: "Easy" },
        { text: "House Robber", level: "Easy" },
        { text: "House Robber II", level: "Medium" },
        { text: "House Robber III", level: "Hard" },
        { text: "Coin Change", level: "Medium" },
        { text: "Coin Change II", level: "Medium" },
        { text: "Longest Increasing Subsequence", level: "Medium" },
        { text: "Longest Common Subsequence", level: "Medium" },
        { text: "Edit Distance", level: "Hard" },
        { text: "Maximum Subarray", level: "Easy" },
        { text: "Maximum Product Subarray", level: "Medium" },
        { text: "Decode Ways", level: "Medium" },
        { text: "Word Break", level: "Medium" },
        { text: "Word Break II", level: "Hard" },
        { text: "Perfect Squares", level: "Medium" },
        { text: "Minimum Path Sum", level: "Medium" },
        { text: "Unique Paths", level: "Medium" },
        { text: "Dungeon Game", level: "Hard" },
        { text: "Partition Equal Subset Sum", level: "Medium" },
        { text: "Knapsack Problem", level: "Medium" },
        { text: "Rod Cutting Problem", level: "Medium" },
        { text: "Matrix Chain Multiplication", level: "Hard" },
        { text: "Longest Palindromic Subsequence", level: "Medium" },
        { text: "Distinct Subsequences", level: "Hard" },
        { text: "Triangle Minimum Path Sum", level: "Medium" },
        { text: "Burst Balloons", level: "Hard" },
        { text: "Target Sum", level: "Medium" },
        { text: "Paint House", level: "Medium" },
        { text: "Stock Buy Sell III", level: "Hard" },
        { text: "Stock Buy Sell IV", level: "Hard" },

        // ===== BACKTRACKING (141–150) =====
        { text: "Permutations", level: "Medium" },
        { text: "Permutations II", level: "Medium" },
        { text: "Combination Sum", level: "Medium" },
        { text: "Combination Sum II", level: "Medium" },
        { text: "Subsets", level: "Medium" },
        { text: "Subsets II", level: "Medium" },
        { text: "Generate Parentheses", level: "Medium" },
        { text: "Letter Combinations of Phone Number", level: "Medium" },
        { text: "Restore IP Addresses", level: "Medium" },
        { text: "N-Queens Problem", level: "Hard" }

    ]
},

// 🔥 Example second course
{
  id: 'python',
  name: 'Python (45 Days)',
  curriculum: [

    {
      title: "Week 1: Python Foundations",
      topics: [
        "Day 1: Introduction, Installation, Hello World",
        "Day 2: Variables & Data Types",
        "Day 3: Operators",
        "Day 4: Strings & formatting",
        "Day 5: Input/Output & Debugging",
        "Day 6: Conditional statements",
        "Day 7: Practice"
      ]
    },

    {
      title: "Week 2: Control Flow & Functions",
      topics: [
        "Day 8: While loop",
        "Day 9: For loop",
        "Day 10: Lists",
        "Day 11: List comprehensions",
        "Day 12: Functions",
        "Day 13: Scope & Lambda",
        "Day 14: Practice"
      ]
    },

    {
      title: "Week 3: Data Structures",
      topics: [
        "Day 15: Tuples",
        "Day 16: Sets",
        "Day 17: Dictionaries",
        "Day 18: Advanced dictionaries",
        "Day 19: Mixed structures",
        "Day 20: Regex & strings",
        "Day 21: Practice"
      ]
    },

    {
      title: "Week 4: File & Exception Handling",
      topics: [
        "Day 22: File reading",
        "Day 23: File writing",
        "Day 24: Exception handling",
        "Day 25: Custom exceptions",
        "Day 26: Context managers",
        "Day 27: JSON",
        "Day 28: Practice"
      ]
    },

    {
      title: "Week 5: OOP",
      topics: [
        "Day 29: Classes & Objects",
        "Day 30: Constructors",
        "Day 31: Methods",
        "Day 32: Inheritance",
        "Day 33: Polymorphism",
        "Day 34: Abstract classes",
        "Day 35: Practice"
      ]
    },

    {
      title: "Week 6: Advanced Concepts",
      topics: [
        "Day 36: Decorators",
        "Day 37: Generators",
        "Day 38: Map/Filter/Reduce",
        "Day 39: Modules",
        "Day 40: Packages",
        "Day 41: Data Structures intro",
        "Day 42: Stack & Queue",
        "Day 43: Linked List",
        "Day 44: Searching",
        "Day 45: Final practice"
      ]
    }

    ],
    questions: [

        // ===== ARRAY & TWO POINTER (1–20) =====
        { text: "Two Sum (Python implementation)", level: "Easy" },
        { text: "Two Sum II (Sorted array)", level: "Easy" },
        { text: "3Sum problem", level: "Medium" },
        { text: "4Sum problem", level: "Medium" },
        { text: "3Sum Closest", level: "Medium" },
        { text: "Container With Most Water", level: "Medium" },
        { text: "Trapping Rain Water", level: "Hard" },
        { text: "Remove Duplicates from Sorted Array", level: "Easy" },
        { text: "Remove Element from array", level: "Easy" },
        { text: "Move Zeroes to end", level: "Easy" },
        { text: "Minimum Size Subarray Sum", level: "Medium" },
        { text: "Sort Colors (Dutch Flag)", level: "Medium" },
        { text: "Merge Sorted Array", level: "Easy" },
        { text: "Rotate Array", level: "Medium" },
        { text: "Best Time to Buy and Sell Stock", level: "Easy" },
        { text: "Best Time to Buy and Sell Stock II", level: "Medium" },
        { text: "Jump Game", level: "Medium" },
        { text: "Jump Game II", level: "Hard" },
        { text: "Find Pivot Index", level: "Easy" },
        { text: "Product of Array Except Self", level: "Medium" },

        // ===== BINARY SEARCH (21–30) =====
        { text: "Binary Search implementation", level: "Easy" },
        { text: "Search Insert Position", level: "Easy" },
        { text: "Find Minimum in Rotated Sorted Array", level: "Medium" },
        { text: "Search in Rotated Sorted Array", level: "Medium" },
        { text: "Median of Two Sorted Arrays", level: "Hard" },
        { text: "Find Peak Element", level: "Medium" },
        { text: "First Bad Version", level: "Easy" },
        { text: "Search a 2D Matrix", level: "Medium" },
        { text: "Sqrt(x)", level: "Easy" },
        { text: "Koko Eating Bananas", level: "Medium" },

        // ===== STRINGS (31–50) =====
        { text: "Valid Palindrome", level: "Easy" },
        { text: "Longest Substring Without Repeating Characters", level: "Medium" },
        { text: "Longest Palindromic Substring", level: "Medium" },
        { text: "Group Anagrams using dictionary", level: "Medium" },
        { text: "Minimum Window Substring", level: "Hard" },
        { text: "Valid Anagram", level: "Easy" },
        { text: "Isomorphic Strings", level: "Easy" },
        { text: "Word Pattern", level: "Easy" },
        { text: "String to Integer (atoi)", level: "Medium" },
        { text: "Reverse Words in a String", level: "Medium" },
        { text: "Longest Common Prefix", level: "Easy" },
        { text: "ZigZag Conversion", level: "Medium" },
        { text: "Wildcard Matching", level: "Hard" },
        { text: "Regular Expression Matching", level: "Hard" },
        { text: "Decode String", level: "Medium" },
        { text: "Count and Say", level: "Easy" },
        { text: "Palindrome Partitioning", level: "Medium" },
        { text: "Shortest Palindrome", level: "Hard" },
        { text: "Longest Repeating Character Replacement", level: "Medium" },
        { text: "Check if two strings are rotations", level: "Easy" },

        // ===== STACK & QUEUE (51–60) =====
        { text: "Valid Parentheses", level: "Easy" },
        { text: "Min Stack", level: "Medium" },
        { text: "Evaluate Reverse Polish Notation", level: "Medium" },
        { text: "Largest Rectangle in Histogram", level: "Hard" },
        { text: "Maximal Rectangle", level: "Hard" },
        { text: "Implement Queue using Stacks", level: "Easy" },
        { text: "Implement Stack using Queues", level: "Easy" },
        { text: "Daily Temperatures", level: "Medium" },
        { text: "Sliding Window Maximum", level: "Hard" },
        { text: "Simplify Path", level: "Medium" },

        // ===== LINKED LIST (61–70) =====
        { text: "Reverse Linked List", level: "Easy" },
        { text: "Merge Two Sorted Lists", level: "Easy" },
        { text: "Linked List Cycle", level: "Easy" },
        { text: "Detect Cycle II", level: "Medium" },
        { text: "Remove Nth Node From End", level: "Medium" },
        { text: "Add Two Numbers", level: "Medium" },
        { text: "Intersection of Two Linked Lists", level: "Easy" },
        { text: "Sort List", level: "Medium" },
        { text: "Merge K Sorted Lists", level: "Hard" },
        { text: "Copy List with Random Pointer", level: "Hard" },

        // ===== HASHING (71–80) =====
        { text: "Contains Duplicate", level: "Easy" },
        { text: "Contains Duplicate II", level: "Easy" },
        { text: "Contains Duplicate III", level: "Medium" },
        { text: "Subarray Sum Equals K", level: "Medium" },
        { text: "Longest Consecutive Sequence", level: "Medium" },
        { text: "Happy Number", level: "Easy" },
        { text: "Intersection of Two Arrays", level: "Easy" },
        { text: "Top K Frequent Elements", level: "Medium" },
        { text: "Find all anagrams in a string", level: "Medium" },
        { text: "Check if array is subset of another", level: "Easy" },

        // ===== HEAP (81–90) =====
        { text: "Kth Largest Element in Array", level: "Medium" },
        { text: "Find Median from Data Stream", level: "Hard" },
        { text: "Top K Frequent Words", level: "Medium" },
        { text: "Reorganize String", level: "Medium" },
        { text: "Task Scheduler", level: "Medium" },
        { text: "Last Stone Weight", level: "Easy" },
        { text: "K Closest Points to Origin", level: "Medium" },
        { text: "Sliding Window Median", level: "Hard" },
        { text: "Smallest Range Covering Elements", level: "Hard" },
        { text: "Merge K Sorted Lists using heap", level: "Hard" },

        // ===== GRAPH (91–110) =====
        { text: "Clone Graph", level: "Medium" },
        { text: "Course Schedule", level: "Medium" },
        { text: "Course Schedule II", level: "Medium" },
        { text: "Number of Islands", level: "Medium" },
        { text: "Flood Fill", level: "Easy" },
        { text: "Word Ladder", level: "Hard" },
        { text: "Graph Valid Tree", level: "Medium" },
        { text: "Minimum Height Trees", level: "Medium" },
        { text: "Network Delay Time", level: "Medium" },
        { text: "Dijkstra Algorithm", level: "Hard" },
        { text: "Detect Cycle in Graph", level: "Medium" },
        { text: "Topological Sort", level: "Medium" },
        { text: "Reconstruct Itinerary", level: "Hard" },
        { text: "Accounts Merge", level: "Medium" },
        { text: "Alien Dictionary", level: "Hard" },
        { text: "Bipartite Graph Check", level: "Medium" },
        { text: "Shortest Path in Grid", level: "Medium" },
        { text: "Number of Connected Components", level: "Medium" },
        { text: "Union Find implementation", level: "Medium" },
        { text: "Rotting Oranges", level: "Medium" },

        // ===== DYNAMIC PROGRAMMING (111–140) =====
        { text: "Climbing Stairs", level: "Easy" },
        { text: "House Robber", level: "Easy" },
        { text: "House Robber II", level: "Medium" },
        { text: "Coin Change", level: "Medium" },
        { text: "Longest Increasing Subsequence", level: "Medium" },
        { text: "Longest Common Subsequence", level: "Medium" },
        { text: "Edit Distance", level: "Hard" },
        { text: "Maximum Subarray", level: "Easy" },
        { text: "Maximum Product Subarray", level: "Medium" },
        { text: "Decode Ways", level: "Medium" },
        { text: "Word Break", level: "Medium" },
        { text: "Word Break II", level: "Hard" },
        { text: "Perfect Squares", level: "Medium" },
        { text: "Minimum Path Sum", level: "Medium" },
        { text: "Unique Paths", level: "Medium" },
        { text: "Dungeon Game", level: "Hard" },
        { text: "Partition Equal Subset Sum", level: "Medium" },
        { text: "Knapsack Problem", level: "Medium" },
        { text: "Rod Cutting", level: "Medium" },
        { text: "Matrix Chain Multiplication", level: "Hard" },
        { text: "Longest Palindromic Subsequence", level: "Medium" },
        { text: "Distinct Subsequences", level: "Hard" },
        { text: "Triangle Minimum Path Sum", level: "Medium" },
        { text: "Burst Balloons", level: "Hard" },
        { text: "Target Sum", level: "Medium" },
        { text: "Paint House", level: "Medium" },
        { text: "Stock Buy Sell III", level: "Hard" },
        { text: "Stock Buy Sell IV", level: "Hard" },
        { text: "Fibonacci using DP", level: "Easy" },
        { text: "Subset Sum Problem", level: "Medium" },

        // ===== BACKTRACKING (141–150) =====
        { text: "Permutations", level: "Medium" },
        { text: "Permutations II", level: "Medium" },
        { text: "Combination Sum", level: "Medium" },
        { text: "Combination Sum II", level: "Medium" },
        { text: "Subsets", level: "Medium" },
        { text: "Subsets II", level: "Medium" },
        { text: "Generate Parentheses", level: "Medium" },
        { text: "Letter Combinations of Phone Number", level: "Medium" },
        { text: "Restore IP Addresses", level: "Medium" },
        { text: "N-Queens Problem", level: "Hard" }

    ]
}
];