import * as React from "react";
import { NavBar } from "../../shared/NavBar";
import { Layout, Button, Select, Row, Col } from "antd";
import { Doughnut } from "react-chartjs-2";
import gql from "graphql-tag";
import { Query, Mutation } from "react-apollo";
import {
  PollQuery,
  PollQueryVariables,
  VoteMutation,
  VoteMutationVariables
} from "@voting/controller";
import { RouteComponentProps } from "react-router-dom";
import { userId } from "../../../routes";

const Option = Select.Option;

const { Content, Footer } = Layout;

const pollQuery = gql`
  query PollQuery($id: Int!) {
    poll(id: $id) {
      id
      name
      userId
      options {
        id
        text
        votes
      }
    }
  }
`;

const voteMutation = gql`
  mutation VoteMutation($pollOptionId: Int!) {
    vote(pollOptionId: $pollOptionId)
  }
`;

const deletePollMutation = gql`
  mutation deletePoll($id: Int!) {
    deletePoll(id: $id)
  }
`;

const getRandomColor: any = (num: number) => {
  const getColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color = color + letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };
  const aColor = [];

  for (let i = 0; i < num; i++) {
    aColor.push(getColor());
  }
  return aColor;
};

export class PollView extends React.Component<
  RouteComponentProps<{ pollId: any }>
> {
  state = {
    selectValue: 0
  };

  handleChange = (value: number) => {
    this.setState({ selectValue: value });
  };

  render() {
    const pollId = parseInt(this.props.match.params.pollId, 10);

    return (
      <Query<PollQuery, PollQueryVariables>
        query={pollQuery}
        variables={{ id: pollId }}
      >
        {({ loading, data, refetch }) => {
          if (loading || !data) {
            return <div> loading</div>;
          }
          const donutColor = getRandomColor(3);
          return (
            <Layout className="layout">
              <NavBar />

              <Content style={{ padding: "50px 50px" }}>
                <div
                  style={{ background: "#fff", padding: 24, minHeight: 280 }}
                >
                  <Row type="flex" justify="center" align="middle">
                    <Col span={4}>
                      <h1>{data.poll[0].name}</h1>
                      <h3>select poll</h3>
                      <Select
                        onChange={this.handleChange}
                        showSearch={true}
                        style={{ width: 200 }}
                        placeholder="select options"
                        optionFilterProp="children"
                        // tslint:disable-next-line:jsx-no-lambda
                        filterOption={(input, option) =>
                          (option.props.children as any)
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {data.poll[0].options.map((x, index) => {
                          return (
                            <Option value={x.id} key={index}>
                              {x.text}
                            </Option>
                          );
                        })}
                      </Select>
                      <div>
                        <Mutation<VoteMutation, VoteMutationVariables>
                          mutation={voteMutation}
                          ignoreResults={false}
                        >
                          {vote => (
                            <Button
                              type="primary"
                              style={{ marginTop: 10, width: "100%" }}
                              // tslint:disable-next-line:jsx-no-lambda
                              onClick={async () => {
                                const results = await vote({
                                  variables: {
                                    pollOptionId: this.state.selectValue
                                  }
                                });
                                if (!(results as any).data.vote) {
                                  alert("You can only vote once");
                                }
                                await refetch();
                              }}
                            >
                              Submit
                            </Button>
                          )}
                        </Mutation>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div>
                        <Doughnut
                          data={{
                            labels: data.poll[0].options.map(
                              (x: any) => x.text
                            ),
                            datasets: [
                              {
                                data: data.poll[0].options.map(
                                  (x: any) => x.votes
                                ),
                                backgroundColor: donutColor,
                                hoverBackgroundColor: donutColor
                              }
                            ]
                          }}
                          width={100}
                          height={70}
                        />
                        {data.poll[0].userId === userId ? (
                          <Mutation mutation={deletePollMutation}>
                            {deletePoll => (
                              <Button
                                type="danger"
                                style={{ marginTop: 10, width: "100%" }}
                                // tslint:disable-next-line:jsx-no-lambda
                                onClick={async () => {
                                  await deletePoll({
                                    variables: {
                                      id: pollId
                                    }
                                  });

                                  this.props.history.push("/mypoll");
                                }}
                              >
                                Delete
                              </Button>
                            )}
                          </Mutation>
                        ) : (
                          ""
                        )}
                      </div>
                    </Col>
                  </Row>
                </div>
              </Content>
              <Footer style={{ textAlign: "center" }}>
                Ant Design ©2016 Created by Ant UED
              </Footer>
            </Layout>
          );
        }}
      </Query>
    );
  }
}
