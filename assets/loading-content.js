/**
 * Engineering Notes Hub - Dynamic Loading Screen Content Provider
 * Provides random study facts, engineering trivia, jokes, quotes, and thoughts
 * with zero-repeat tracking per session.
 */

(function () {
    const LOADING_CONTENT = {
        study: [
            { category: "📚 DSA Fact", text: "QuickSort has an average time complexity of O(n log n), but degrades to O(n²) when bad pivot selection occurs on already sorted arrays." },
            { category: "🧠 OOP Concept", text: "In Object-Oriented Programming, Polymorphism allows methods to do different things based on the object acting upon them — via method overriding or overloading." },
            { category: "💻 OS Insight", text: "A Deadlock occurs in an Operating System when four Coffman conditions are met: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait." },
            { category: "⚙️ COA Trivia", text: "Von Neumann architecture shares a single memory space for both instruction data and user data, whereas Harvard architecture separates them." },
            { category: "📐 Math Concept", text: "The Fourier Transform converts a time-domain signal into its constituent frequencies in the frequency domain — critical for DSP and communications." },
            { category: "📚 DSA Fact", text: "Arrays provide O(1) random access by memory indexing, whereas Linked Lists require O(n) linear traversal to access an element." },
            { category: "🧠 OOP Concept", text: "Encapsulation restricts direct access to some of an object's components, bundling data with methods that operate on that data inside a class." },
            { category: "💻 OS Insight", text: "Virtual Memory uses Paging to map continuous virtual address spaces to non-contiguous physical RAM frames using Page Tables and TLBs." },
            { category: "⚙️ COA Trivia", text: "Pipelining improves CPU instruction throughput by overlapping execution stages (Fetch, Decode, Execute, Memory, Writeback)." },
            { category: "📐 Math Concept", text: "In Graph Theory, Euler's Formula states that for any connected planar graph, V - E + F = 2, where V is vertices, E is edges, and F is faces." },
            { category: "📚 DSA Fact", text: "A Hash Table achieves O(1) average lookup time using a hash function, but requires collision resolution techniques like Chaining or Open Addressing." },
            { category: "🧠 OOP Concept", text: "An Abstract Class cannot be instantiated directly and often contains pure virtual functions that derived subclasses must override." },
            { category: "💻 OS Insight", text: "Semaphores and Mutexes are synchronization primitives used to prevent Data Races in multithreaded concurrent programming." },
            { category: "⚙️ COA Trivia", text: "Cache Memory relies on Temporal Locality (re-using recent data) and Spatial Locality (accessing nearby memory addresses)." },
            { category: "📐 Math Concept", text: "A Matrix is invertible (non-singular) if and only if its Determinant is non-zero (det(A) ≠ 0)." },
            { category: "📚 DSA Fact", text: "Binary Search Trees (BST) guarantee O(log n) search time when balanced (like AVL or Red-Black Trees), but can degrade to O(n) if unbalanced." },
            { category: "💻 OS Insight", text: "Thrashing occurs in an OS when the CPU spends more time swapping pages between RAM and disk than executing actual application processes." },
            { category: "⚙️ COA Trivia", text: "RISC (Reduced Instruction Set Computer) focuses on simple single-cycle instructions, whereas CISC implements complex multi-cycle instructions." }
        ],
        fact: [
            { category: "🌐 Tech Fact", text: "The first computer bug was an actual physical moth trapped inside the Harvard Mark II computer relay in 1947." },
            { category: "🔬 Science Fact", text: "Fiber optic cables transmit data across the world using Total Internal Reflection at nearly 200,000 kilometers per second." },
            { category: "💾 Tech Fact", text: "In 1956, IBM shipped the 305 RAMAC — the first commercial computer with a hard drive. It stored 5MB of data and weighed over one ton!" },
            { category: "🌐 Web Fact", text: "The World Wide Web (WWW) was invented by Sir Tim Berners-Lee in 1989 while working at CERN in Switzerland." },
            { category: "🤖 Tech Fact", text: "The term 'Robot' originated from the Czech word 'robota', which translates to 'forced labor' or 'drudgery'." },
            { category: "⚡ Science Fact", text: "Silicon is the second most abundant element in the Earth's crust after oxygen, making it ideal for semiconductor manufacturing." },
            { category: "🌐 Tech Fact", text: "The first domain name ever registered on the internet was symbolics.com on March 15, 1985." },
            { category: "💻 History Fact", text: "The QWERTY keyboard layout was originally designed in 1873 to slow typists down and prevent physical typewriter keys from jamming." },
            { category: "📱 Tech Fact", text: "The Apollo 11 Guidance Computer that landed humans on the Moon had only 4KB of RAM and ran at a clock speed of 0.043 MHz!" },
            { category: "🔬 Science Fact", text: "Light takes approximately 8 minutes and 20 seconds to travel 93 million miles from the Sun to the Earth." },
            { category: "🌐 Internet Fact", text: "Over 99% of international internet traffic flows through undersea submarine fiber optic cables laid across ocean floors." },
            { category: "💾 Tech Fact", text: "The first 1 Gigabyte hard disk drive was released by IBM in 1980, cost $40,000, and was the size of a refrigerator!" }
        ],
        joke: [
            { category: "😄 Tech Joke", text: "Why do programmers prefer Dark Mode? Because light attracts bugs!" },
            { category: "😄 Tech Joke", text: "There are 10 types of people in the world: those who understand binary, and those who don't." },
            { category: "😄 Tech Joke", text: "Why did the programmer quit his job? Because he didn't get arrays!" },
            { category: "😄 Tech Joke", text: "A SQL query walks into a bar, walks up to two tables and asks: 'Can I join you?'" },
            { category: "😄 Tech Joke", text: "Why do Java developers wear glasses? Because they don't C#!" },
            { category: "😄 Tech Joke", text: "How many programmers does it take to change a lightbulb? None, that's a hardware problem!" },
            { category: "😄 Tech Joke", text: "What is an algorithm? A word used by programmers when they don't want to explain what they did." },
            { category: "😄 Tech Joke", text: "Real programmers count from 0." },
            { category: "😄 Tech Joke", text: "Software engineering rule #1: If it works, don't touch it!" },
            { category: "😄 Tech Joke", text: "Debugging is like being a detective in a crime movie where you are also the murderer." },
            { category: "😄 Tech Joke", text: "An optimist sees the glass as half full. A pessimist sees it as half empty. An engineer sees it as twice as large as necessary." },
            { category: "😄 Tech Joke", text: "Hardware is the part of a computer that you can kick; Software is the part that you can only curse at." },
            { category: "😄 Tech Joke", text: "Why was the JavaScript developer sad? Because he didn't Null how to Express himself!" }
        ],
        quote: [
            { category: "💬 Inspiration", text: "“Talk is cheap. Show me the code.” — Linus Torvalds" },
            { category: "💬 Inspiration", text: "“First, solve the problem. Then, write the code.” — John Johnson" },
            { category: "💬 Inspiration", text: "“Any fool can write code that a computer can understand. Good programmers write code that humans can understand.” — Martin Fowler" },
            { category: "💬 Inspiration", text: "“The best way to predict the future is to invent it.” — Alan Kay" },
            { category: "💬 Inspiration", text: "“Simplicity is prerequisite for reliability.” — Edsger W. Dijkstra" },
            { category: "💬 Inspiration", text: "“Computers are good at following instructions, but not at reading your mind.” — Donald Knuth" },
            { category: "💬 Inspiration", text: "“Premature optimization is the root of all evil.” — Donald Knuth" },
            { category: "💬 Inspiration", text: "“The advance of technology is based on making it fit in so that you don't even notice it.” — Bill Gates" },
            { category: "💬 Inspiration", text: "“Code is like humor. When you have to explain it, it’s bad.” — Cory House" },
            { category: "💬 Inspiration", text: "“Experience is the name everyone gives to their mistakes.” — Oscar Wilde" },
            { category: "💬 Inspiration", text: "“Knowledge is power, but enthusiasm pulls the switch.” — Ivern Ball" }
        ],
        thought: [
            { category: "💭 Random Thought", text: "If practice makes perfect, and nobody is perfect, why practice?" },
            { category: "💭 Random Thought", text: "Ctrl + Z in real life would solve 99% of our problems." },
            { category: "💭 Random Thought", text: "Reading unit tests is often the best documentation a codebase has." },
            { category: "💭 Random Thought", text: "Every error message is a sign that the system is trying to protect itself from invalid assumptions." },
            { category: "💭 Random Thought", text: "Writing clean code is like writing a letter to your future self — make sure it's friendly!" },
            { category: "💭 Random Thought", text: "The most powerful programming tool is still a blank piece of paper and a sharp pencil." },
            { category: "💭 Random Thought", text: "Comments explain WHY the code exists; the code explains HOW it works." },
            { category: "💭 Random Thought", text: "Automating a task for 5 hours that would take 5 minutes manually is the true engineer's rite of passage." },
            { category: "💭 Random Thought", text: "Computer science is no more about computers than astronomy is about telescopes." },
            { category: "💭 Random Thought", text: "There are two hard things in Computer Science: cache invalidation and naming things." }
        ]
    };

    function getRandomLoadingContent() {
        try {
            const categories = Object.keys(LOADING_CONTENT);
            const chosenCategoryKey = categories[Math.floor(Math.random() * categories.length)];
            const itemList = LOADING_CONTENT[chosenCategoryKey] || LOADING_CONTENT.study;

            const lastShownText = sessionStorage.getItem('last_loading_content_text') || '';
            let filteredList = itemList.filter(item => item && item.text !== lastShownText);
            if (filteredList.length === 0) filteredList = itemList;

            const selectedItem = filteredList[Math.floor(Math.random() * filteredList.length)];
            if (selectedItem && selectedItem.text) {
                sessionStorage.setItem('last_loading_content_text', selectedItem.text);
                return selectedItem;
            }
        } catch (e) {
            console.warn('Error fetching loading content:', e);
        }

        return {
            category: "📚 Engineering Hub",
            text: "Loading course syllabus, notes & resources..."
        };
    }

    function getLoadingSpinnerHTML(defaultSubtext = '') {
        const item = getRandomLoadingContent();
        const categoryLabel = item.category || '📚 Engineering Hub';
        const contentText = item.text || defaultSubtext || 'Loading latest data from Supabase...';

        return `
            <div class="enh-loading-container" style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 36px 20px;
                text-align: center;
                max-width: 620px;
                margin: 0 auto;
                animation: fadeIn 0.3s ease-in-out;
            ">
                <div class="enh-spinner" style="
                    margin-bottom: 18px;
                    color: #0ea5e9;
                ">
                    <i class="fa-solid fa-circle-notch fa-spin fa-2x"></i>
                </div>
                <div class="enh-loading-badge" style="
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 12px;
                    border-radius: 20px;
                    background: rgba(14, 165, 233, 0.12);
                    color: #0ea5e9;
                    font-size: 0.82rem;
                    font-weight: 700;
                    letter-spacing: 0.03em;
                    text-transform: uppercase;
                    margin-bottom: 10px;
                    border: 1px solid rgba(14, 165, 233, 0.25);
                ">
                    ${categoryLabel}
                </div>
                <p class="enh-loading-text" style="
                    margin: 0;
                    font-size: 0.96rem;
                    line-height: 1.55;
                    font-weight: 500;
                    color: var(--text-main, #334155);
                    opacity: 0.92;
                ">
                    ${contentText}
                </p>
            </div>
        `;
    }

    window.LoadingContentManager = {
        getRandomContent,
        getLoadingSpinnerHTML
    };
})();
