// Copyright (c) 2020 Faiz Surani. All rights reserved.

// NOTE: This should be run from the master spreadsheet's script editor, not the template's.
// It is safe to run this after every round without making any manual change to the Team Ballots folder.
// The script is smart enough to see existing ballot PDFs and not recreate or overwrite them.
function CreateTeamBallotFolders() {
    const tabFolder = getTabFolder();
    const ballots = getAllBallots(tabFolder);
    const exportFolder = getChildFolder(tabFolder, EXPORT_FOLDER_NAME)
    exportBallots(ballots, exportFolder);
    console.log(ballots.length);
}

function exportBallots(ballots, exportFolder) {
    for (let ballot of ballots) {
        const ballotSheet = sheetForFile(ballot);
        const submittedRange = ballotSheet.getRangeByName(BallotRanges.SUBMITTED);
        if (!submittedRange || !submittedRange.getValue()) {
            console.log(`${ballotSheet.getName()} not submitted, skipping...`)
            continue;
        }
        const plaintiffTeam = ballotSheet.getRangeByName(BallotRanges.PLAINTIFF_TEAM).getValue();
        const defenseTeam = ballotSheet.getRangeByName(BallotRanges.DEFENSE_TEAM).getValue();
        const round = ballotSheet.getRangeByName(BallotRanges.ROUND).getValue();
        const judgeName = ballotSheet.getRangeByName(BallotRanges.JUDGE_NAME).getValue();
        const pdfName = `R${round} - ${plaintiffTeam} v. ${defenseTeam} (Judge ${judgeName}).pdf`;

        let existingBallot;
        for (let team of [plaintiffTeam, defenseTeam]) {
            if (team === "") continue;
            const teamFolder = getChildFolder(exportFolder, "Team " + team + " ") // The "Team" and space are important so we don't get a snafu where one team number is a prefix/suffix of another.
            const teamRoundFolder = getChildFolder(teamFolder, `Round ${round} `);
            let pdfBallot = getFileByName(teamRoundFolder, pdfName);
            if (!pdfBallot) {
                pdfBallot = existingBallot || ballot.getAs("application/pdf");
                pdfBallot.setName(pdfName);
                existingBallot = pdfBallot; // We can save half of the exports by saving the ballot blob for the second go-round.
                teamRoundFolder.createFile(pdfBallot);
                console.log(`Adding ${pdfName} to ${teamFolder.getName()}...`)
            } else {
                console.log(`${pdfName} already present in ${teamFolder.getName()}, skipping...`);
            }
        }
    }
}
