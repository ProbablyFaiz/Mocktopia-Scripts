// Copyright (c) 2020 Faiz Surani. All rights reserved.

const IndividualResultsIndices = {
    ROUND: 0,
    JUDGE_NAME: 1,
    TEAM_NUMBER: 2,
    COMPETITOR_NAME: 3,
    SIDE: 4,
    TYPE: 5,
    RANK_VALUE: 6,
    OUTPUT_RANK_VALUE: 2,
}

const normalizeValue = (total, factor) => {
    return Math.round(((total * factor) + Number.EPSILON) * 100) / 100
}

const compareIndividualResults = (first, second) => {
    return second[IndividualResultsIndices.OUTPUT_RANK_VALUE] - first[IndividualResultsIndices.OUTPUT_RANK_VALUE];
}

const createIndividualResultsOutput = (competitorMap) => {
    const resultsArr = [];
    competitorMap.forEach((competitorObject, competitorKey) => {
        const competitorInfo = JSON.parse(competitorKey);
        let totalRankValue = 0;
        Object.values(competitorObject).forEach(roundRanks => {
            const normalizingFactor = NUM_BALLOTS / roundRanks.length;
            const roundRankValue = roundRanks.reduce((accumulator, rankValue) => accumulator + rankValue, 0);
            totalRankValue += normalizeValue(roundRankValue, normalizingFactor);
        });
        const individualResult = [competitorInfo["team"], competitorInfo["name"], competitorInfo["side"], totalRankValue];
        resultsArr.push(individualResult);
    });
    resultsArr.sort(compareIndividualResults);
    return resultsArr;
}

const tabulateIndividualBallot = (ballot, index, rankingType, firstRound, lastRound, competitorMap) => {
    const roundNumber = ballot[IndividualResultsIndices.ROUND];
    if (ballot[IndividualResultsIndices.TYPE] !== rankingType ||
        ballot[IndividualResultsIndices.TEAM_NUMBER] === "" ||
        ballot[IndividualResultsIndices.COMPETITOR_NAME].trim() === "" ||
        roundNumber < firstRound ||
        roundNumber > lastRound
    )
        return;
    const competitorKey = {
        team: ballot[IndividualResultsIndices.TEAM_NUMBER],
        name: ballot[IndividualResultsIndices.COMPETITOR_NAME].trim(),
        side: ballot[IndividualResultsIndices.SIDE]
    };
    let competitorObject;
    if (competitorMap.has(competitorKey)) {
        competitorObject = competitorMap.get(competitorKey);
    } else {
        competitorObject = {};
        competitorMap.set(competitorKey, competitorObject);
    }
    if (!(roundNumber in competitorObject)) {
        competitorObject[roundNumber] = [];
    }
    competitorObject[roundNumber].push(ballot[IndividualResultsIndices.RANK_VALUE]);
}

function TABULATEINDIVIDUALBALLOTS(ballotsRange, rankingType, startRound, endRound) {
    const firstRound = startRound ? startRound : Number.MIN_SAFE_INTEGER;
    const lastRound = endRound ? endRound : Number.MAX_SAFE_INTEGER;
    const competitorMap = new TupleMap();
    ballotsRange.forEach((ballot, index) => tabulateIndividualBallot(ballot, index, rankingType, firstRound, lastRound, competitorMap));
    return createIndividualResultsOutput(competitorMap);
}
