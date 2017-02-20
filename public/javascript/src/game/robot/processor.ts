import { FieldSprite } from '../sprites';
import { ParsingService, WordService } from '../../ast/parser';
import Machine from '../compiler/machine';
import {
    AnyValueNode,
    AssignmentNode,
    ClassNode,
    ExpandVariableNode,
    ExportNode,
    ExportSequenceNode,
    FunctionNode,
    NumberNode,
    OperationNode,
    PrivateScopeNode,
    ScopeNode,
    SequenceNode,
    StringNode,
    SwitchComparisonNode,
    SwitchNode,
    UnwrapSequenceNode,
    VariableNode
} from '../../ast/availableNodes';
import { Operator, SyntaxNode } from '../../ast/node';
import { Action, ActionType, Direction, GameState, IState, Map, Position, Robot } from '../../models';


class RobotAstScope {

    private root: SequenceNode;

    public constructor(robot: Robot) {
        let code = `
the robot is a Robot (
    the position is a Position (
        the row is ${robot.position.row}
        the column is ${robot.position.column}
    )
)
the field is a Field (
    the position is a Position (
        the row is ${robot.position.row}
        the column is ${robot.position.column}
    )
)

when attack in the direction (
    switch our direction (
        up (
            field.position.row is our robot.position.row - 1
        )
        down (
            field.position.row is our robot.position.row + 1
        )
        left (
            field.position.column is our robot.position.column - 1
        )
        right (
            field.position.column is our robot.position.column + 1
        )
    )

    notify attack our direction
    export field
)

when move in the direction (
    switch our direction (
        up (
            robot.position.row is our robot.position.row - 1
        )
        down (
            robot.position.row is our robot.position.row + 1
        )
        left (
            robot.position.column is our robot.position.column - 1
        )
        right (
            robot.position.column is our robot.position.column + 1
        )
    )
    
    notify movement our direction
    export robot
)`;
        this.root = new ParsingService(WordService.create(code)).parse() as SequenceNode;
    }

    public add(node: SyntaxNode) {
        this.root.children.push(node);
        return this;
    }

    public addCode(code: string) {
        this.root.children.push(new ParsingService(WordService.create(code)).parse());
        return this;
    }

    public done(type: ActionType = ActionType.Movement) {
        return new ExportSequenceNode(...this.root.children,
            new ExportNode(new StringNode(type === ActionType.Movement ? "robot" : "field")));
    }
}

export default class RobotProcessor {
    robot: Robot;
    map: Map;

    public constructor(map: Map, robot: Robot) {
        this.robot = robot;
        this.map = map;
    }

    private onSameSpot(robot: Position, field: Position) {
        return robot.column === field.column && robot.row == field.row;
    }

    private checkPointInsideMap(value: number, max: number) {
        if (value < 0 || value > max) throw `died because outside the map: ${value} > ${max}`;
    }

    private checkCollision(robot: Robot) {
        let fields = (this.map as any).fields;
        if (!fields) return;

        fields.forEach((field: any) => {
            if (this.onSameSpot(robot.position, field.position))
                throw `died because collision with ${field.sprite} on ${JSON.stringify(robot.position)}`;
        });
    }

    private doRun(robotScope: RobotAstScope, type: ActionType) {
        let result = new Machine().run(robotScope.done(type)) as Robot;
        switch (type) {
            case ActionType.Movement:
                this.checkPointInsideMap(result.position.row, this.map.size.row);
                this.checkPointInsideMap(result.position.column, this.map.size.column);
                this.checkCollision(result);

                if (console.debug)
                    console.debug(`Robot moved to ${JSON.stringify(result.position)}`);
                return result;
            case ActionType.Attack:
                return result;
        }
    }

    public runCode(code: string, registeredHandlers: { [key: string]: (movement: Action) => void }) {
        let robotScope = new RobotAstScope({
            position: {
                row: this.robot.position.row,
                column: this.robot.position.column
            }
        });

        let onAction = (direction: string, type: ActionType) => {
            direction = direction.toLocaleUpperCase();
            if (console.debug)
                console.debug(`Subscription to "${ActionType[type]}" triggered with movement in direction "${direction}"`);
            if (registeredHandlers[ActionType[type]]) {
                registeredHandlers[ActionType[type]]({
                    type: type,
                    direction: Direction[direction]
                });
            }
        };

        return new Machine()
            .subscribe("movement", (_) => onAction(_, ActionType.Movement))
            .subscribe("attack", (_) => onAction(_, ActionType.Attack))
            .run(robotScope.addCode(code).done());
    }

    public runNode(node: SyntaxNode, type: ActionType = ActionType.Movement) {
        let robotScope = new RobotAstScope({
            position: {
                row: this.robot.position.row,
                column: this.robot.position.column
            }
        });

        return this.doRun(robotScope.add(node), type);
    }
}