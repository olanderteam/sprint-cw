import { formatSquadName, getStoryPoints, mapStatus, mapPriority, getOriginalIssueType, determineHealth } from '../data-aggregator';
import { Issue } from '../jira-client';

describe('formatSquadName', () => {
  it('should keep Squad de Content as is', () => {
    expect(formatSquadName('Squad de Content')).toBe('Squad de Content');
  });

  it('should remove "quadro" prefix and map GH', () => {
    expect(formatSquadName('quadro GH')).toBe('Growth Hacking');
  });

  it('should remove "quadro" prefix and map LDC', () => {
    expect(formatSquadName('quadro LDC')).toBe('Lideranças do CEO');
  });

  it('should remove "board" suffix and map SCC', () => {
    expect(formatSquadName('SCC board')).toBe('Squad CW Cast/CW Class');
  });

  it('should remove "quadro" prefix and map AO', () => {
    expect(formatSquadName('quadro AO')).toBe('Agile Onboarding');
  });

  it('should map CONT to Squad de Content', () => {
    expect(formatSquadName('CONT')).toBe('Squad de Content');
  });

  it('should map GWT to Squad de Growth', () => {
    expect(formatSquadName('GWT')).toBe('Squad de Growth');
  });

  it('should map CHN to Squad de Channel', () => {
    expect(formatSquadName('CHN')).toBe('Squad de Channel');
  });

  it('should handle empty string', () => {
    expect(formatSquadName('')).toBe('Unknown Squad');
  });

  it('should handle unknown short codes', () => {
    expect(formatSquadName('XYZ')).toBe('Squad XYZ');
  });
});

describe('getStoryPoints', () => {
  it('should extract story points from story_points field', () => {
    const issue: Issue = {
      id: '1',
      key: 'TEST-1',
      fields: {
        summary: 'Test',
        status: { name: 'Done' },
        issuetype: { name: 'Story' },
        created: '2024-01-01',
        story_points: 5,
      },
    };
    expect(getStoryPoints(issue)).toBe(5);
  });

  it('should extract story points from customfield_10028', () => {
    const issue: Issue = {
      id: '1',
      key: 'TEST-1',
      fields: {
        summary: 'Test',
        status: { name: 'Done' },
        issuetype: { name: 'Story' },
        created: '2024-01-01',
        customfield_10028: 3,
      },
    };
    expect(getStoryPoints(issue)).toBe(3);
  });

  it('should return 0 if no story points found', () => {
    const issue: Issue = {
      id: '1',
      key: 'TEST-1',
      fields: {
        summary: 'Test',
        status: { name: 'Done' },
        issuetype: { name: 'Story' },
        created: '2024-01-01',
      },
    };
    expect(getStoryPoints(issue)).toBe(0);
  });
});

describe('mapStatus', () => {
  it('should map Done status', () => {
    expect(mapStatus('Done')).toBe('Done');
    expect(mapStatus('Closed')).toBe('Done');
    expect(mapStatus('Resolved')).toBe('Done');
  });

  it('should map In Progress status', () => {
    expect(mapStatus('In Progress')).toBe('In Progress');
    expect(mapStatus('In Development')).toBe('In Progress');
    expect(mapStatus('Coding')).toBe('In Progress');
  });

  it('should map In Review status', () => {
    expect(mapStatus('In Review')).toBe('In Review');
    expect(mapStatus('QA')).toBe('In Review');
    expect(mapStatus('Testing')).toBe('In Review');
  });

  it('should map To Do status', () => {
    expect(mapStatus('To Do')).toBe('To Do');
    expect(mapStatus('Backlog')).toBe('To Do');
  });
});

describe('mapPriority', () => {
  it('should map High priority', () => {
    expect(mapPriority('High')).toBe('High');
    expect(mapPriority('Critical')).toBe('High');
    expect(mapPriority('Blocker')).toBe('High');
  });

  it('should map Low priority', () => {
    expect(mapPriority('Low')).toBe('Low');
    expect(mapPriority('Trivial')).toBe('Low');
  });

  it('should map Medium priority', () => {
    expect(mapPriority('Medium')).toBe('Medium');
    expect(mapPriority('')).toBe('Medium');
    expect(mapPriority(undefined)).toBe('Medium');
  });
});

describe('getOriginalIssueType', () => {
  it('should preserve original Bug type', () => {
    expect(getOriginalIssueType('Bug')).toBe('Bug');
  });

  it('should preserve original Story type', () => {
    expect(getOriginalIssueType('Story')).toBe('Story');
  });

  it('should preserve original Task type', () => {
    expect(getOriginalIssueType('Task')).toBe('Task');
  });

  it('should preserve original Epic type', () => {
    expect(getOriginalIssueType('Epic')).toBe('Epic');
  });

  it('should normalize empty string to Unknown', () => {
    expect(getOriginalIssueType('')).toBe('Unknown');
    expect(getOriginalIssueType('   ')).toBe('Unknown');
  });
});

describe('determineHealth', () => {
  it('should return green for high completion and no blockers', () => {
    expect(determineHealth(80, 0)).toBe('green');
    expect(determineHealth(100, 0)).toBe('green');
  });

  it('should return red for low completion', () => {
    expect(determineHealth(30, 0)).toBe('red');
    expect(determineHealth(30, 1)).toBe('red');
  });

  it('should return red for many blockers', () => {
    expect(determineHealth(70, 3)).toBe('red');
    expect(determineHealth(80, 5)).toBe('red');
  });

  it('should return yellow for moderate completion', () => {
    expect(determineHealth(60, 0)).toBe('yellow');
    expect(determineHealth(70, 1)).toBe('yellow');
  });
});
