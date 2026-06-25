// Taskmaster UK - Series data for ranking
// Each series is a rankable item; contestants shown for context
// Images can be added as `images/series/{id}.jpg`

const TASKMASTER_DATA = {
  main_series: [
    { id: 's01', name: 'Series 1', year: 2015, contestants: ['Frank Skinner', 'Josh Widdicombe', 'Roisin Conaty', 'Romesh Ranganathan', 'Tim Key'], winner: 'Josh Widdicombe' },
    { id: 's02', name: 'Series 2', year: 2016, contestants: ['Doc Brown', 'Joe Wilkinson', 'Jon Richardson', 'Katherine Ryan', 'Richard Osman'], winner: 'Katherine Ryan' },
    { id: 's03', name: 'Series 3', year: 2016, contestants: ['Al Murray', 'Dave Gorman', 'Paul Chowdhry', 'Rob Beckett', 'Sara Pascoe'], winner: 'Rob Beckett' },
    { id: 's04', name: 'Series 4', year: 2017, contestants: ['Hugh Dennis', 'Joe Lycett', 'Lolly Adefope', 'Mel Giedroyc', 'Noel Fielding'], winner: 'Noel Fielding' },
    { id: 's05', name: 'Series 5', year: 2017, contestants: ['Aisling Bea', 'Bob Mortimer', 'Mark Watson', 'Nish Kumar', 'Sally Phillips'], winner: 'Bob Mortimer' },
    { id: 's06', name: 'Series 6', year: 2018, contestants: ['Alice Levine', 'Asim Chaudhry', 'Liza Tarbuck', 'Russell Howard', 'Tim Vine'], winner: 'Liza Tarbuck' },
    { id: 's07', name: 'Series 7', year: 2018, contestants: ['James Acaster', 'Jessica Knappett', 'Kerry Godliman', 'Phil Wang', 'Rhod Gilbert'], winner: 'Kerry Godliman' },
    { id: 's08', name: 'Series 8', year: 2019, contestants: ['Iain Stirling', 'Joe Thomas', 'Lou Sanders', 'Paul Sinha', 'Sian Gibson'], winner: 'Lou Sanders' },
    { id: 's09', name: 'Series 9', year: 2019, contestants: ['David Baddiel', 'Ed Gamble', 'Jo Brand', 'Katy Wix', 'Rose Matafeo'], winner: 'Ed Gamble' },
    { id: 's10', name: 'Series 10', year: 2020, contestants: ['Daisy May Cooper', 'Johnny Vegas', 'Katherine Parkinson', 'Mawaan Rizwan', 'Richard Herring'], winner: 'Richard Herring' },
    { id: 's11', name: 'Series 11', year: 2021, contestants: ['Charlotte Ritchie', 'Jamali Maddix', 'Lee Mack', 'Mike Wozniak', 'Sarah Kendall'], winner: 'Sarah Kendall' },
    { id: 's12', name: 'Series 12', year: 2021, contestants: ['Alan Davies', 'Desiree Burch', 'Guz Khan', 'Morgana Robinson', 'Victoria Coren Mitchell'], winner: 'Morgana Robinson' },
    { id: 's13', name: 'Series 13', year: 2022, contestants: ['Ardal O\'Hanlon', 'Bridget Christie', 'Chris Ramsey', 'Judi Love', 'Sophie Duker'], winner: 'Sophie Duker' },
    { id: 's14', name: 'Series 14', year: 2022, contestants: ['Dara Ó Briain', 'Fern Brady', 'John Kearns', 'Munya Chawawa', 'Sarah Millican'], winner: 'Dara Ó Briain' },
    { id: 's15', name: 'Series 15', year: 2023, contestants: ['Frankie Boyle', 'Ivo Graham', 'Jenny Eclair', 'Kiell Smith-Bynoe', 'Mae Martin'], winner: 'Mae Martin' },
    { id: 's16', name: 'Series 16', year: 2023, contestants: ['Julian Clary', 'Lucy Beaumont', 'Sam Campbell', 'Sue Perkins', 'Susan Wokoma'], winner: 'Sam Campbell' },
    { id: 's17', name: 'Series 17', year: 2024, contestants: ['Joanne McNally', 'John Robins', 'Nick Mohammed', 'Sophie Willan', 'Steve Pemberton'], winner: 'John Robins' },
    { id: 's18', name: 'Series 18', year: 2024, contestants: ['Andy Zaltzman', 'Babatunde Aléshé', 'Emma Sidi', 'Jack Dee', 'Rosie Jones'], winner: 'Andy Zaltzman' },
    { id: 's19', name: 'Series 19', year: 2025, contestants: ['Fatiha El-Ghorri', 'Jason Mantzoukas', 'Mathew Baynton', 'Rosie Ramsey', 'Stevie Martin'], winner: 'Mathew Baynton' },
    { id: 's20', name: 'Series 20', year: 2025, contestants: ['Ania Magliano', 'Maisie Adam', 'Phil Ellis', 'Reece Shearsmith', 'Sanjeev Bhaskar'], winner: 'Maisie Adam' },
    { id: 's21', name: 'Series 21', year: 2026, contestants: ['Amy Gledhill', 'Armando Iannucci', 'Joanna Page', 'Joel Dommett', 'Kumail Nanjiani'], winner: 'Joanna Page' },
  ],

  champion_of_champions: [
    { id: 'coc1', name: 'Champion of Champions 1', year: 2017, contestants: ['Bob Mortimer', 'Josh Widdicombe', 'Katherine Ryan', 'Noel Fielding', 'Rob Beckett'], winner: 'Josh Widdicombe' },
    { id: 'coc2', name: 'Champion of Champions 2', year: 2022, contestants: ['Ed Gamble', 'Kerry Godliman', 'Liza Tarbuck', 'Lou Sanders', 'Richard Herring'], winner: 'Richard Herring' },
    { id: 'coc3', name: 'Champion of Champions 3', year: 2024, contestants: ['Dara Ó Briain', 'Kiell Smith-Bynoe', 'Morgana Robinson', 'Sarah Kendall', 'Sophie Duker'], winner: 'Dara Ó Briain' },
    { id: 'coc4', name: 'Champion of Champions 4', year: 2025, contestants: ['Andy Zaltzman', 'John Robins', 'Maisie Adam', 'Mathew Baynton', 'Sam Campbell'], winner: 'Mathew Baynton' },
  ],

  new_years_treat: [
    { id: 'nyt1', name: "New Year's Treat 1", year: 2021, contestants: ['John Hannah', 'Krishnan Guru-Murthy', 'Nicola Coughlan', 'Rylan Clark', 'Shirley Ballas'], winner: 'Shirley Ballas' },
    { id: 'nyt2', name: "New Year's Treat 2", year: 2022, contestants: ['Adrian Chiles', 'Claudia Winkleman', 'Jonnie Peacock', 'Lady Leshurr', 'Sayeeda Warsi'], winner: 'Adrian Chiles' },
    { id: 'nyt3', name: "New Year's Treat 3", year: 2023, contestants: ['Amelia Dimoldenberg', 'Carol Vorderman', 'Greg James', 'Mo Farah', 'Rebecca Lucy Taylor'], winner: 'Mo Farah' },
    { id: 'nyt4', name: "New Year's Treat 4", year: 2024, contestants: ['Deborah Meaden', 'Kojey Radical', 'Lenny Rush', 'Steve Backshall', 'Zoe Ball'], winner: 'Lenny Rush' },
    { id: 'nyt5', name: "New Year's Treat 5", year: 2024, contestants: ['David James', 'Hannah Fry', 'Martin Lewis', 'Melanie Blatt', 'Sue Johnston'], winner: 'Sue Johnston' },
    { id: 'nyt6', name: "New Year's Treat 6", year: 2026, contestants: ['Big Zuu', 'Jill Scott', 'Rose Ayling-Ellis', 'Sam Ryder', 'Susie Dent'], winner: 'Rose Ayling-Ellis' },
  ]
};
