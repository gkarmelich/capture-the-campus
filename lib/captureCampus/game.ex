defmodule CaptureCampus.Game do

  def new(channel_no) do
    %{
      team1: [],
      team2: [],
      channel_no: channel_no,
    }
  end

  def addPlayer(user_id, game_size, state) do
    team1 = state.team1
    team2 = state.team2
    if length(team1) < div(game_size, 2) do
      team1 = team1 ++ [user_id]
      state = Map.put(state, :team1, team1)
    else
      team2 = team2 ++ [user_id]
      state = Map.put(state, :team2, team2)
    end
    state
  end

  def removePlayer(user_id, state) do
    team1 = state.team1
    team2 = state.team2
    if Enum.member?(team1, user_id) do
      team1 = List.delete(team1, user_id)
      state = Map.put(state, :team1, team1)
    end
    if Enum.member?(team2, user_id) do
      team2 = List.delete(team2, user_id)
      state = Map.put(state, :team2, team2)
    end
    state
  end

end
