require 'rubygems'
require 'bundler/setup'

require 'socket'
require 'json'
require 'redis'

server = TCPServer.new(3000)
redis = Redis.new

loop do
  client = server.accept

  while line = client.gets("ENDREQ")
    begin
      line = line[/STARTREQ(.*?)ENDREQ/m, 1]
      line = JSON.parse(line.chomp)

      redis.hset('temperature', Time.now.to_i, line['Temperature'])
      redis.hset('humidity', Time.now.to_i, line['humidity'])
      redis.hset('pulse', Time.now.to_i, line['Pulse'])
      redis.hset('gas', Time.now.to_i, line['Gas'])
    rescue Exception => e
      puts "Failed to process request: #{e}"
      next
    end
  end

  client.close
end
