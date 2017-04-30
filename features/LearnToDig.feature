Feature: LearnToDig Map
  As a player of robbie the robot
  When opening the LearnToDig Level
  I should be able to move and dig to win

  Scenario: Winning
    Given I open the level LearnToDig
    When I choose action Dig
    And I move down
    When I choose action Movement
    And I move down
    When I choose action Dig
    And I move right
    When I choose action Movement
    And I move right
    And I move down
    And I move down
    And I move right
    And I move right
    When I run my program
    Then I should see the win notification


  Scenario: Loosing by running in wall
    Given I open the level LearnToDig
    When I move down
    When I run my program
    Then I should see the loose notification