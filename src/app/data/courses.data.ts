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
    name: 'Core Java',
    curriculum: [

        {
            title: "Java Fundamentals & Environment Setup",
            topics: [
                "Introduction to Java, history, features, and platform independence concept",
                "Understanding JDK, JRE, JVM architecture and execution flow",
                "Installing Java, configuring environment variables (JAVA_HOME, PATH)",
                "Writing, compiling, and executing your first Java program",
                "Understanding bytecode, class files, and Java program lifecycle"
            ]
        },

        {
            title: "Variables, Data Types & Type Casting",
            topics: [
                "Primitive data types with memory allocation and ranges",
                "Non-primitive data types like arrays, strings, and objects",
                "Type casting (implicit and explicit) with real-world scenarios",
                "Constants using final keyword and naming conventions",
                "Wrapper classes and autoboxing/unboxing mechanism"
            ]
        },

        {
            title: "Operators in Java",
            topics: [
                "Arithmetic operators and operator precedence rules",
                "Relational operators for comparison logic",
                "Logical operators (AND, OR, NOT) in conditional checks",
                "Bitwise operators and their low-level usage",
                "Ternary operator for concise conditional expressions"
            ]
        },

        {
            title: "Control Flow Statements",
            topics: [
                "if, if-else, nested if statements with real examples",
                "Switch statements and modern switch expressions",
                "Break and continue statements usage in loops",
                "Writing clean and readable conditional logic",
                "Real-world applications of decision-making constructs"
            ]
        },

        {
            title: "Loops and Iteration Techniques",
            topics: [
                "for, while, and do-while loops with differences",
                "Nested loops and pattern-based coding problems",
                "Loop optimization and performance tuning",
                "Avoiding infinite loops and debugging techniques",
                "Using loops in real-world data processing scenarios"
            ]
        },

        {
            title: "Arrays and Memory Handling",
            topics: [
                "Single-dimensional arrays and memory allocation",
                "Multi-dimensional arrays and matrix operations",
                "Array traversal techniques and iteration patterns",
                "Sorting algorithms (Bubble, Selection, Insertion)",
                "Searching algorithms (Linear and Binary Search)"
            ]
        },

        {
            title: "Strings and String Manipulation",
            topics: [
                "String class and immutability concept",
                "StringBuilder and StringBuffer differences",
                "Common string methods and operations",
                "String comparison and memory handling",
                "Real-world string processing use cases"
            ]
        },

        {
            title: "Methods and Functional Design",
            topics: [
                "Method declaration, definition, and invocation",
                "Method overloading and compile-time polymorphism",
                "Recursion and problem-solving techniques",
                "Return types and parameter passing mechanisms",
                "Designing reusable and modular methods"
            ]
        },

        {
            title: "Classes, Objects & Constructors",
            topics: [
                "Class structure and object creation",
                "Constructors (default, parameterized)",
                "this keyword and its use cases",
                "Memory allocation and object lifecycle",
                "Best practices for class design"
            ]
        },

        {
            title: "Encapsulation & Data Hiding",
            topics: [
                "Encapsulation concept and real-world analogy",
                "Using private variables and access control",
                "Getter and setter methods implementation",
                "Immutable classes design",
                "Security and data protection techniques"
            ]
        },

        {
            title: "Inheritance in Java",
            topics: [
                "Types of inheritance (single, multilevel, hierarchical)",
                "super keyword usage in constructors and methods",
                "Method overriding and runtime polymorphism",
                "Constructor chaining and execution order",
                "IS-A relationship in object-oriented design"
            ]
        },

        {
            title: "Polymorphism",
            topics: [
                "Compile-time vs runtime polymorphism",
                "Method overloading vs method overriding",
                "Dynamic method dispatch mechanism",
                "Real-world examples of polymorphism",
                "Best practices for implementing polymorphism"
            ]
        },

        {
            title: "Abstraction",
            topics: [
                "Abstract classes and abstract methods",
                "Difference between abstraction and encapsulation",
                "When and why to use abstraction",
                "Design principles using abstraction",
                "Practical examples and use cases"
            ]
        },

        {
            title: "Interfaces",
            topics: [
                "Interface basics and implementation",
                "Multiple inheritance using interfaces",
                "Default and static methods in interfaces",
                "Functional interfaces and lambda usage",
                "Real-world interface design patterns"
            ]
        },

        {
            title: "Packages & Access Modifiers",
            topics: [
                "Creating and organizing packages",
                "Access modifiers (public, private, protected, default)",
                "Importing packages and classes",
                "Jar files and packaging applications",
                "Best practices for project structure"
            ]
        },

        {
            title: "Exception Handling",
            topics: [
                "Types of exceptions (checked vs unchecked)",
                "try, catch, finally blocks usage",
                "throw and throws keywords",
                "Creating custom exceptions",
                "Exception handling best practices"
            ]
        },

        {
            title: "Collections Framework",
            topics: [
                "List interface (ArrayList, LinkedList)",
                "Set interface (HashSet, TreeSet)",
                "Map interface (HashMap, TreeMap)",
                "Iterators and traversal techniques",
                "Comparable vs Comparator usage"
            ]
        },

        {
            title: "Multithreading & Concurrency",
            topics: [
                "Thread lifecycle and states",
                "Creating threads using Thread and Runnable",
                "Synchronization and thread safety",
                "Deadlock and concurrency issues",
                "Thread pools and Executor framework"
            ]
        },

        {
            title: "File Handling & I/O Streams",
            topics: [
                "File class and file operations",
                "Reading and writing using FileReader/FileWriter",
                "BufferedReader and performance optimization",
                "Serialization and deserialization concepts",
                "Working with binary and text files"
            ]
        },

        {
            title: "Java 8 Features",
            topics: [
                "Lambda expressions and functional programming",
                "Streams API and data processing",
                "Functional interfaces and usage",
                "Method references and code simplification",
                "Optional class and null handling"
            ]
        },

        {
            title: "JDBC (Database Connectivity)",
            topics: [
                "Connecting Java with databases",
                "Statement and PreparedStatement usage",
                "ResultSet and data retrieval",
                "Transactions and commit/rollback",
                "Best practices for database operations"
            ]
        },

        {
            title: "Servlets",
            topics: [
                "Servlet lifecycle and architecture",
                "Handling requests using doGet and doPost",
                "Session tracking and management",
                "Cookies and filters",
                "Building dynamic web applications"
            ]
        },

        {
            title: "JSP (Java Server Pages)",
            topics: [
                "JSP basics and lifecycle",
                "Directives and scripting elements",
                "Expression Language (EL)",
                "JSTL and tag libraries",
                "MVC architecture implementation"
            ]
        },

        {
            title: "Project Development",
            topics: [
                "Setting up a real-time project structure",
                "Implementing CRUD operations",
                "Integrating frontend and backend",
                "Database integration and testing",
                "Deploying application to server"
            ]
        },

        {
            title: "Interview Preparation & Placement",
            topics: [
                "Common Java interview questions and answers",
                "Coding problem-solving strategies",
                "HR interview preparation",
                "Resume building and optimization",
                "Mock interviews and feedback sessions"
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
    name: 'Python',
    curriculum: [

        {
            title: "Python Fundamentals & Setup",
            topics: [
                "Introduction to Python, history, features, and real-world applications",
                "Installing Python, setting up IDE (VS Code / PyCharm)",
                "Understanding Python interpreter and execution flow",
                "Writing and running your first Python program",
                "Understanding indentation and Python syntax rules"
            ]
        },

        {
            title: "Variables & Data Types",
            topics: [
                "Python variables and dynamic typing concept",
                "Built-in data types (int, float, str, bool)",
                "Type checking and type conversion",
                "Mutable vs immutable data types",
                "Memory management and references in Python"
            ]
        },

        {
            title: "Operators in Python",
            topics: [
                "Arithmetic operators and precedence rules",
                "Comparison and relational operators",
                "Logical operators (and, or, not)",
                "Bitwise operators and their usage",
                "Assignment operators and shorthand operations"
            ]
        },

        {
            title: "Control Flow Statements",
            topics: [
                "if, elif, else statements with examples",
                "Nested conditional statements",
                "Using logical conditions effectively",
                "Best practices for writing readable conditions",
                "Real-world decision-making scenarios"
            ]
        },

        {
            title: "Loops & Iterations",
            topics: [
                "for loop and range function usage",
                "while loop and loop control statements",
                "Break, continue, and pass statements",
                "Nested loops and pattern problems",
                "Loop optimization and real-world examples"
            ]
        },

        {
            title: "Strings & String Operations",
            topics: [
                "String creation and immutability",
                "String slicing and indexing",
                "Common string methods (split, join, replace)",
                "String formatting (f-strings, format method)",
                "Real-world text processing examples"
            ]
        },

        {
            title: "Lists & List Operations",
            topics: [
                "Creating and manipulating lists",
                "List indexing, slicing, and iteration",
                "List methods (append, remove, sort)",
                "List comprehensions and advanced usage",
                "Real-world list processing scenarios"
            ]
        },

        {
            title: "Tuples, Sets & Dictionaries",
            topics: [
                "Tuple creation and immutability",
                "Set operations and uniqueness",
                "Dictionary structure and key-value pairs",
                "Dictionary methods and iteration",
                "Choosing the right data structure"
            ]
        },

        {
            title: "Functions in Python",
            topics: [
                "Defining and calling functions",
                "Arguments (positional, keyword, default)",
                "Return values and multiple returns",
                "Lambda functions and anonymous functions",
                "Best practices for reusable functions"
            ]
        },

        {
            title: "Modules & Packages",
            topics: [
                "Importing modules and using libraries",
                "Creating custom modules",
                "Understanding __name__ and module execution",
                "Working with packages and folder structure",
                "Popular built-in modules overview"
            ]
        },

        {
            title: "Object-Oriented Programming (OOP)",
            topics: [
                "Classes and objects in Python",
                "Constructors (__init__ method)",
                "Instance variables and methods",
                "Encapsulation and data hiding",
                "Real-world OOP examples"
            ]
        },

        {
            title: "Inheritance & Polymorphism",
            topics: [
                "Types of inheritance in Python",
                "Method overriding and super() usage",
                "Polymorphism and dynamic typing",
                "Multiple inheritance concepts",
                "Best practices in OOP design"
            ]
        },

        {
            title: "Abstraction & Interfaces",
            topics: [
                "Abstract classes using abc module",
                "Defining abstract methods",
                "Difference between abstraction and encapsulation",
                "Interface-like behavior in Python",
                "Design principles using abstraction"
            ]
        },

        {
            title: "Exception Handling",
            topics: [
                "Types of exceptions in Python",
                "try, except, else, finally blocks",
                "Handling multiple exceptions",
                "Creating custom exceptions",
                "Best practices for error handling"
            ]
        },

        {
            title: "File Handling",
            topics: [
                "Reading and writing text files",
                "Working with file modes (r, w, a, b)",
                "Using with statement for file handling",
                "Handling CSV and JSON files",
                "Real-world file processing use cases"
            ]
        },

        {
            title: "Python Standard Libraries",
            topics: [
                "Working with math and random modules",
                "Datetime module for date/time operations",
                "OS module for system interaction",
                "Sys module and command-line arguments",
                "Exploring useful standard libraries"
            ]
        },

        {
            title: "Data Structures & Algorithms",
            topics: [
                "Introduction to algorithms and complexity",
                "Sorting algorithms (bubble, merge, quick)",
                "Searching algorithms (linear, binary)",
                "Stacks, queues, and linked lists",
                "Problem-solving techniques"
            ]
        },

        {
            title: "Functional Programming",
            topics: [
                "Lambda functions and map/filter/reduce",
                "List, set, and dictionary comprehensions",
                "Higher-order functions",
                "Iterators and generators",
                "Writing clean functional code"
            ]
        },

        {
            title: "Working with APIs",
            topics: [
                "Introduction to REST APIs",
                "Making API calls using requests library",
                "Handling JSON responses",
                "Authentication and headers",
                "Real-world API integration examples"
            ]
        },

        {
            title: "Database Connectivity",
            topics: [
                "Connecting Python with databases",
                "Using SQLite and MySQL",
                "Executing queries and transactions",
                "ORM basics (SQLAlchemy)",
                "Best practices for database handling"
            ]
        },

        {
            title: "Web Development with Python",
            topics: [
                "Introduction to Flask framework",
                "Routing and request handling",
                "Templates and dynamic rendering",
                "Building REST APIs",
                "Deploying web applications"
            ]
        },

        {
            title: "Data Analysis with Python",
            topics: [
                "Introduction to NumPy arrays",
                "Working with Pandas DataFrames",
                "Data cleaning and preprocessing",
                "Basic data visualization",
                "Real-world data analysis projects"
            ]
        },

        {
            title: "Automation & Scripting",
            topics: [
                "Writing automation scripts in Python",
                "File and folder automation tasks",
                "Web scraping basics (BeautifulSoup)",
                "Task scheduling and cron jobs",
                "Real-world automation examples"
            ]
        },

        {
            title: "Project Development",
            topics: [
                "Building real-world Python projects",
                "Structuring project folders",
                "Integrating APIs and databases",
                "Testing and debugging applications",
                "Deployment and hosting"
            ]
        },

        {
            title: "Interview Preparation",
            topics: [
                "Common Python interview questions",
                "Coding problem-solving strategies",
                "Data structures and algorithms revision",
                "Resume building and portfolio creation",
                "Mock interviews and feedback"
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